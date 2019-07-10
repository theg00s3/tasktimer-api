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
  const result = pomodoros.map(({day, docs}, index) => {
    return {
      day,
      pomodoros: docs,
      todos: (todos.find(t => t.day === day) || {}).docs || []
    }
  })
  logger.info('result', result)
  return result
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
          // year: { $year: `$${field}` },
          // month: { $month: `$${field}` },
          // day: { $dayOfMonth: `$${field}` }
          year: { $substr: [`$${field}`, 0, 4] },
          month: { $substr: [`$${field}`, 5, 2] },
          day: { $substr: [`$${field}`, 8, 2] }
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
          // day: { $toString: '$_id.day' },
          // day: { '$convert': { input: '$_id.day', to: 'string' } },
          // month: { $toString: '$_id.month' },
          // month: { '$convert': { input: '$_id.month', to: 'string' } },
          // year: { $toString: '$_id.year' },
          // year: { '$convert': { input: '$_id.year', to: 'string' } },
          // year: '$_id.year',
          // month: '$_id.month',
          // day: '$_id.day',
          _id: 0,
          day: {
            $concat: ['$_id.year', '-', '$_id.month', '-', '$_id.day']
          },
          docs: '$docs'
        }
      }
    ]
  )
}
