const app = require('../app')
const passport = require('passport')
const session = require('express-session')
const TwitterStrategy = require('passport-twitter').Strategy
const GithubStrategy = require('passport-github').Strategy
const MongoStore = require('connect-mongo')(session)
const UserInfo = require('../modules/UserInfo')
const User = require('../models/User')
const Pusher = require('pusher')
var pusher = new Pusher({
  appId: '781806',
  key: 'd50be9e8b6b4af4885ce',
  secret: 'c78e3d8cbdfb31c9a98a',
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

app.post('/pair/:channel', (req, res) => {
  const channel = req.params.channel
  const body = req.body
  pusher.trigger(channel, 'event', {
    channel,
    body
  }, (err, response) => {
    if (err) throw err
    res.end()
  })
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
