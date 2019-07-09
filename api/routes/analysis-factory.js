const { Router } = require('express')
const monk = require('monk')
const router = Router()

module.exports = router

const Pomodoro = require('../models/Pomodoro')
const Todo = require('../models/Todo')
const logger = require('pino')()

router.get('/analysis', async (req, res) => {
  logger.info('get analysis', req.user)
  const analysis = await getAnalysis(req).catch(console.error)
  return res.json(analysis || [])
})

async function getAnalysis (req) {
  const pomodoros = await aggregate({collection: Pomodoro, userId: req.user._id, field: 'startedAt'})
  const todos = await aggregate({collection: Todo, userId: req.user._id, field: 'completedAt'})
  return pomodoros.map(({day, docs}, index) => {
    return {
      day,
      pomodoros: docs,
      todos: (todos.find(t => t.day === day) || {}).todos || []
    }
  })
}

async function aggregate ({collection, userId, field = 'startedAt'}) {
  return collection.aggregate(
    [
      {
        $match: {
          userId: monk.id(userId)
        }
      }, {
        $project: {
          doc: '$$ROOT',
          year: { $year: `$${field}` },
          month: { $month: `$${field}` },
          day: { $day: `$${field}` }
        }
      }, {
        $group: {
          _id: {
            year: '$year',
            month: '$month',
            day: '$day'
          },
          docs: {
            $push: '$doc'
          }
        }
      }, {
        $project: {
          _id: 0,
          day: {
            $concat: ['$_id.year', '$_id.month', '$_id.day']
          },
          docs: '$docs'
        }
      }
    ]
  )
}
