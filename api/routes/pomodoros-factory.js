const { Router } = require('express')
const router = new Router()

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
