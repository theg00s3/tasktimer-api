const { Router } = require('express')
const router = Router()
const Event = require('../models/Event')

module.exports = router

const TeamPomodoro = require('../models/TeamPomodoro')
const logger = require('pino')()

const Pusher = require('pusher')
var pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'eu',
  useTLS: true
})

function getRemaining (pomodoro) {
  let remaining = 0
  if (pomodoro && !pomodoro.cancelled && pomodoro.minutes && pomodoro.startedAt) {
    let elapsed = (Date.now() - +new Date(pomodoro.startedAt))
    elapsed = elapsed / 1000 << 0
    remaining = pomodoro.minutes * 60 - elapsed
  }
  remaining = remaining << 0
  return remaining
}

// team
router.post('/team/:channel', async (req, res) => {
  const body = JSON.parse(JSON.stringify(req.body))
  logger.info('body', body)
  const channel = req.params.channel
  await Event.insert({ name: 'createTeamChannel', channel, createdAt: new Date(), user: { _id: req.user && req.user._id, username: req.user && req.user.username } }).catch(Function.prototype)
  if (!body.minutes || !body.type) {
    res.writeHead(422)
    await Event.insert({ name: 'createTeamChannelFailed', channel, createdAt: new Date(), user: { _id: req.user && req.user._id, username: req.user && req.user.username } }).catch(Function.prototype)
    return res.end()
  }
  let pomodoro = await TeamPomodoro.findOne({ channel }) || {}

  const remaining = getRemaining(pomodoro)

  if (remaining === 0 || (pomodoro.minutes !== body.minutes)) {
    pomodoro.startedAt = new Date()
    pomodoro.cancelled = false
  } else {
    pomodoro.cancelled = (pomodoro.minutes === body.minutes)
  }
  pomodoro = Object.assign({}, pomodoro, body)

  pomodoro = await TeamPomodoro.findOneAndUpdate({ channel }, { $set: pomodoro }, { new: true, upsert: true })

  if (process.env.NODE_ENV !== 'test') {
    pusher.trigger(channel, 'event', {
      channel,
      pomodoro
    }, (err, response) => {
      if (err) throw err
      res.json(pomodoro)
    })
  } else {
    res.json(pomodoro)
  }
  await Event.insert({ name: 'createTeamChannelSucceeded', channel, createdAt: new Date(), user: { _id: req.user && req.user._id, username: req.user && req.user.username } }).catch(Function.prototype)
})

router.get('/team/:channel/status', async (req, res) => {
  const channel = req.params.channel
  await Event.insert({ name: 'getTeamChannelStatus', channel, createdAt: new Date(), user: { _id: req.user && req.user._id, username: req.user && req.user.username } }).catch(Function.prototype)
  const pomodoro = await TeamPomodoro.findOne({ channel }) || {}
  logger.info('channel, pomodoro', channel, pomodoro)

  res.json(pomodoro)
})
