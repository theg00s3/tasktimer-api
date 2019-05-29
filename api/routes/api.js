const app = require('../app')
const passport = require('passport')
const session = require('express-session')
const TwitterStrategy = require('passport-twitter').Strategy
const GithubStrategy = require('passport-github').Strategy
const MongoStore = require('connect-mongo')(session)
const UserInfo = require('../modules/UserInfo')
const User = require('../models/User')
const PairPomodoro = require('../models/PairPomodoro')
const Pusher = require('pusher')
var pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'eu',
  useTLS: true
})

const redirectRoutes = { failureRedirect: 'https://pomodoro.cc', successRedirect: 'https://pomodoro.cc' }

module.exports = app

if (process.env.NODE_ENV === 'production') {
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'foo',
    cookie: {
      domain: '.pomodoro.cc',
      sameSite: false
    },
    store: new MongoStore({
      collection: 'sessions',
      url: process.env.MONGO_URL
    })
  }))

  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL
  }, upsertAuthenticatedUser))
  passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, upsertAuthenticatedUser))

  passport.serializeUser(function (user, done) {
    done(null, user)
  })

  passport.deserializeUser(function (user, done) {
    done(null, user)
  })

  app.get('/twitter', passport.authenticate('twitter'))
  app.get('/twitter/callback', passport.authenticate('twitter', redirectRoutes))
  app.get('/github', passport.authenticate('github'))
  app.get('/github/callback', passport.authenticate('github', redirectRoutes))
}

app.get('/info', (req, res) => {
  console.log('req.user', req.user)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }
  res.json(req.user)
})
app.get('/logout', (req, res) => {
  console.log('req.user', req.user)
  req.logout()
  res.end()
})

app.get('/api', (req, res) => {
  res.end('ok')
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

app.post('/pair/:channel', async (req, res) => {
  const body = JSON.parse(JSON.stringify(req.body))
  console.log('body', body)
  if (!body.minutes || !body.type) {
    res.writeHead(422)
    return res.end()
  }
  const channel = req.params.channel
  let pomodoro = await PairPomodoro.findOne({ channel }) || {}

  const remaining = getRemaining(pomodoro)

  if (remaining === 0 || (pomodoro.minutes !== body.minutes)) {
    pomodoro.startedAt = new Date()
    pomodoro.cancelled = false
  } else {
    pomodoro.cancelled = (pomodoro.minutes === body.minutes)
  }
  pomodoro = Object.assign({}, pomodoro, body)

  pomodoro = await PairPomodoro.findOneAndUpdate({ channel }, { $set: pomodoro }, { new: true, upsert: true })

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
})

app.get('/pair/:channel/status', async (req, res) => {
  const channel = req.params.channel
  const pomodoro = await PairPomodoro.findOne({ channel }) || {}

  res.json(pomodoro)
})

if (process.env.NODE_ENV !== 'production') {
  app.get('/fake', (req, res) => {
    console.log('req.user', req.user)
    req.user = {
      '_id': '5a9fe4e085d766000c002636',
      'apikey': 'xxx',
      'id': '2662706',
      'avatar': 'https://avatars0.githubusercontent.com/u/2662706?v=4',
      'username': 'christian-fei'
    }
    res.json(req.user)
  })
}

function upsertAuthenticatedUser (token, tokenSecret, profile, done) {
  var user = new UserInfo(profile).toJSON()

  User.findOne({ id: user.id })
    .then(user => {
      if (user) return done(null, user)
      User.insert(new UserInfo(profile))
        .then(user => {
          done(null, user)
        })
        .catch(err => {
          if (err) return done(err, null)
        })
    })
}
