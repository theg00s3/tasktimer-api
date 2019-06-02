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
const Event = require('./models/Event')

const middlewares = require('./middlewares')

app.set('trust proxy', 1)
app.use(...middlewares)

console.log(JSON.stringify(process.env))

if (process.env.USE_AUTH || process.env.NODE_ENV === 'production') {
  const redirectRoutes = { failureRedirect: process.env.BASE_URL, successRedirect: process.env.BASE_URL }
  console.log('using auth', { redirectRoutes })
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'foo',
    cookie: {
      domain: process.env.NODE_ENV === 'production' ? '.pomodoro.cc' : 'localhost',
      sameSite: false
    },
    store: new MongoStore({
      collection: 'sessions',
      url: process.env.MONGO_URL
    })
  }))

  app.use(passport.initialize())
  app.use(passport.session())
  passport.serializeUser(function (user, done) {
    done(null, user)
  })

  passport.deserializeUser(function (user, done) {
    done(null, user)
  })

  if (process.env.TWITTER_CONSUMER_KEY) {
    passport.use(new TwitterStrategy({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL
    }, upsertAuthenticatedUser))
    app.get('/twitter', passport.authenticate('twitter'))
    app.get('/twitter/callback', passport.authenticate('twitter', redirectRoutes))
  } else {
    console.log('process.env.TWITTER_CONSUMER_KEY not set', process.env.TWITTER_CONSUMER_KEY)
  }

  if (process.env.GITHUB_CLIENT_ID) {
    passport.use(new GithubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    }, upsertAuthenticatedUser))
    app.get('/github', passport.authenticate('github'))
    app.get('/github/callback', passport.authenticate('github', redirectRoutes))
  } else {
    console.log('process.env.GITHUB_CLIENT_ID not set', process.env.GITHUB_CLIENT_ID)
  }
} else {
  console.log('not using auth')
}

module.exports = app

function upsertAuthenticatedUser (token, tokenSecret, profile, done) {
  var user = new UserInfo(profile).toJSON()
  console.log('user', user)

  User.findOne({ id: user.id })
    .then(user => {
      if (user) return done(null, user)
      User.insert(new UserInfo(profile))
        .then(async user => {
          await Event.insert({ name: 'createUserSucceeded', createdAt: new Date(), user }).catch(Function.prototype)
          done(null, user)
        })
        .catch(async err => {
          await Event.insert({ name: 'createUserFailed', createdAt: new Date(), err }).catch(Function.prototype)
          if (err) return done(err, null)
        })
    })
}
