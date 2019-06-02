const app = require('express')()
const Sentry = require('@sentry/node')
Sentry.init({ dsn: process.env.SENTRY_DSN })
const passport = require('passport')
const session = require('express-session')
const TwitterStrategy = require('passport-twitter').Strategy
const GithubStrategy = require('passport-github').Strategy
const MongoStore = require('connect-mongo')(session)
const UserInfo = require('./modules/UserInfo')
const User = require('./models/User')
// const Event = require('../models/Event')

const middlewares = require('./middlewares')

app.set('trust proxy', 1)
app.use(...middlewares)

if (process.env.USE_AUTH === true || process.env.NODE_ENV === 'production') {
  const redirectRoutes = { failureRedirect: 'https://pomodoro.cc', successRedirect: 'https://pomodoro.cc' }
  console.log('using auth')
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
} else {
  console.log('not using auth')
}

module.exports = app

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
