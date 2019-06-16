const api = require('../app')
// const User = require('../models/User')
// const Event = require('../models/Event')
const Pomodoro = require('../models/Pomodoro')
const DuplicateError = require('../errors/duplicate')
const PomodoroQueryBuilder = require('../modules/PomodoroQueryBuilder')
const { createUserPomodoro } = require('../modules/create-user-pomodoro')
const logger = require('pino')()

module.exports = api

api.get('/pomodoros', async (req, res) => {
  const pomodoroQuery = PomodoroQueryBuilder().withRequest(req).build()
  logger.info('pomodoroQuery', pomodoroQuery)
  const pomodoros = await Pomodoro.find(pomodoroQuery)
  logger.info('pomodoros', pomodoros)
  res.json(pomodoros)
})

api.post('/pomodoros', async (req, res) => {
  logger.info('create pomodoro for user', req.user && req.user.username, req.body)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }

  const user = req.user
  const pomodoro = req.body
  await createUserPomodoro({ user, pomodoro })
    .then((pomodoro) => {
      logger.info(pomodoro)
      res.json(pomodoro)
    })
    .catch(err => {
      logger.error(err)
      if (err instanceof DuplicateError) {
        res.writeHead(409)
        return res.end()
      }
      res.writeHead(422)
      return res.end()
    })
})
