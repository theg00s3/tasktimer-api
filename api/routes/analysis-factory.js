const { Router } = require('express')
const monk = require('monk')
const router = Router()
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(utc)
dayjs.extend(weekOfYear)

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
  const data = pomodoros.map(({day, docs}, index) => {
    return {
      day,
      pomodoros: docs,
      todos: (todos.find(t => t.day === day) || {}).docs || []
    }
  })
  const result = getDataWithEmptyDays(data)

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

function getDataWithEmptyDays (data) {
  const datesList = []
  data.sort((a, b) => a.day.localeCompare(b.day))
  const start = dayjs(data[0].day)
  const end = dayjs(data[data.length - 1].day)
  const diffInDays = Math.abs(end.diff(start, 'day'))
  for (let i = 1; i <= diffInDays + 1; i++) {
    const day = start.add(i, 'days')
    datesList.push(day.toISOString().substr(0, 10))
  }
  const dataWithEmptyDays = datesList.reduce((acc, day) => {
    const daily = data.find(d => d.day === day) || { day: day, pomodoros: [], todos: [] }
    return acc.concat([daily])
  }, [])

  const max = Math.max(...dataWithEmptyDays.map(d => d.pomodoros.length))
  return dataWithEmptyDays.map(d => Object.assign(d, {
    percentage: d.pomodoros.length / max
  }))
  .sort((a, b) => b.day.localeCompare(a.day))
}