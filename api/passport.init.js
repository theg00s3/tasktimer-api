var credentials = require('../credentials.json')
  , passport = require('passport')
  , UserInfo = require('./modules/UserInfo')
  , TwitterStrategy = require('passport-twitter').Strategy
  , GitHubStrategy = require('passport-github').Strategy
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , User = require('./models/User')


module.exports = function(app){
  app.use(
    session({
      store: new RedisStore({
        host: 'pomodoro-api-sessions',
        port: 6379
      }),
      cookie: {
        maxAge : 1000*60*60*24*5
      },
      secret: process.env.POMODORO_AUTH_SESSION_SECRET || 'lolcat'
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())

  passport.serializeUser(function(user, done) {
    done(null, user)
  })

  passport.deserializeUser(function(user, done) {
    done(null, user)
  })

  passport.use(
    new TwitterStrategy({
      consumerKey: credentials.TWITTER_CONSUMER_KEY,
      consumerSecret: credentials.TWITTER_CONSUMER_SECRET,
      callbackURL: credentials.TWITTER_CALLBACK_URL
    }, authenticatedUser)
  )
  passport.use(
    new GitHubStrategy({
      clientID: credentials.GITHUB_CLIENT_ID,
      clientSecret: credentials.GITHUB_CLIENT_SECRET,
      callbackURL: credentials.GITHUB_CALLBACK_URL
    }, authenticatedUser)
  )


  function authenticatedUser(token, tokenSecret, profile, done){
    var user = new UserInfo(profile).toJSON()
    User.findOne({
      id: user.id
    },handleUser(done, profile))
  }

  function handleUser(done, profile){
    return function(err,user){
      if( err ) return done(err,null)
      if( user ) return done(null, user)
      user = new UserInfo(profile)
      User.create(user,function(err,user){
        if( err ) return done(err,null)
        done(null,user[0])
      })
    }
  }
}
