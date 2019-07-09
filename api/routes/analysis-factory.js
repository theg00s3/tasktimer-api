const { Router } = require('express')
const monk = require('monk')
const router = Router()

module.exports = router

const Pomodoro = require('../models/Pomodoro')
const logger = require('pino')()

router.get('/analysis', async (req, res) => {
  logger.info('get analysis', req.user)
  const analysis = await getAnalysis(req).catch(console.error)
  return res.json(analysis || [])
})

async function getAnalysis (req) {
  return Pomodoro.aggregate(
    [
      {
        $match: {
          userId: monk.id(req.user._id)
        }
      }, {
        $project: {
          doc: '$$ROOT',
          day: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startedAt'
            }
          }
        }
      }, {
        $group: {
          _id: '$day',
          docs: {
            $push: '$doc'
          }
        }
      }, {
        $project: {
          _id: 0,
          day: '$_id',
          pomodoros: '$docs'
        }
      }
    ]
  )
}
