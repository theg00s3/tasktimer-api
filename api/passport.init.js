const passport = require('passport')
const UserInfo = require('./modules/UserInfo')
const TwitterStrategy = require('passport-twitter').Strategy
const GitHubStrategy = require('passport-github').Strategy
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const User = require('./models/User')

module.exports = function (app) {
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'foo',
    cookie: {
      domain: '.pomodoro.cc',
      sameSite: false
      // maxAge?: number;
      // signed?: boolean;
      // expires?: Date | boolean;
      // httpOnly?: boolean;
      // path?: string;
      // domain?: string;
      // secure?: boolean | 'auto';
      // encode?: (val: string) => void;
      // sameSite?: boolean | string;
    },
    store: new MongoStore({
      collection: 'sessions',
      url: process.env.MONGO_URL
    })
  }))

  app.use(passport.initialize())
  console.log('initialized api')
  app.use(passport.session())

  passport.serializeUser(function (user, done) {
    done(null, user)
  })

  passport.deserializeUser(function (user, done) {
    done(null, user)
  })

  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL
  }, authenticatedUser))
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, authenticatedUser))

  function authenticatedUser (token, tokenSecret, profile, done) {
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
}
