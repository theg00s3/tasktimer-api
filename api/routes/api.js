const app = require('../app')
const passport = require('passport')
const session = require('express-session')
const TwitterStrategy = require('passport-twitter').Strategy
const GithubStrategy = require('passport-github').Strategy
const MongoStore = require('connect-mongo')(session)
const UserInfo = require('../modules/UserInfo')
const User = require('../models/User')

module.exports = app

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

const redirectRoutes = { failureRedirect: 'https://pomodoro.cc', successRedirect: 'https://pomodoro.cc' }

app.get('/info', (req, res) => {
  console.log('req.user', req.user)
  res.json(req.user)
})
app.get('/logout', (req, res) => {
  console.log('req.user', req.user)
  req.logout()
  res.end()
})
app.get('/twitter', passport.authenticate('twitter'))
app.get('/twitter/callback', passport.authenticate('twitter', redirectRoutes))
app.get('/github', passport.authenticate('github'))
app.get('/github/callback', passport.authenticate('github', redirectRoutes))

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
