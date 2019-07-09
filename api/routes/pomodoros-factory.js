const { Router } = require('express')
const monk = require('monk')
const router = Router()

module.exports = router

const Pomodoro = require('../models/Pomodoro')
const DuplicateError = require('../errors/duplicate')
const PomodoroQueryBuilder = require('../modules/PomodoroQueryBuilder')
const { createUserPomodoro } = require('../modules/create-user-pomodoro')
const logger = require('pino')()

router.get('/pomodoros', async (req, res) => {
  const pomodoroQuery = PomodoroQueryBuilder().withRequest(req).build()
  logger.info('pomodoroQuery', pomodoroQuery)
  const pomodoros = await Pomodoro.find(pomodoroQuery)
  return res.json(pomodoros)
})

router.get('/pomodoros/daily', async (req, res) => {
  const daily = await getDailyPomodoros(req).catch(console.error)
  return res.json(daily || [])
})

router.post('/pomodoros', async (req, res) => {
  logger.info('create pomodoro for user', req.user && req.user.username, req.body)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }

  const user = req.user
  const pomodoro = req.body
  return createUserPomodoro({ user, pomodoro })
    .then((pomodoro) => {
      logger.info(pomodoro)
      return res.json(pomodoro)
    })
    .catch(err => {
      logger.error(err)
      if (err instanceof DuplicateError) {
        logger.info('DuplicateError pomodoro', err, pomodoro)
        console.log('err.errors', err.errors)
        return res
          .status(409)
          .json(err.msg)
      }
      return res
        .status(422)
        .json(err.errors)
    })
})

async function getDailyPomodoros (req) {
  return Pomodoro.aggregate(
    [
      {
        $match: {
          userId: monk.id(req.user._id)
        }
      // }, {
      //   $addFields: {
      //     startedAt: {
      //       $convert: {
      //         input: '$startedAt',
      //         to: 'date'
      //       }
      //     }
      //   }
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
