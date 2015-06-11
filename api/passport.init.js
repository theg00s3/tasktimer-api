var credentials = require('../credentials.json')
  , passport = require('passport')
  , UserInfo = require('./modules/UserInfo')
  , TwitterStrategy = require('passport-twitter').Strategy
  , GitHubStrategy = require('passport-github').Strategy
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , db = require('./modules/db.connection')


module.exports = function(app){
  var users

  db(function(conn){
    users = conn.collection('users')
  })

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
    }, getUserInfo)
  )
  passport.use(
    new GitHubStrategy({
      clientID: credentials.GITHUB_CLIENT_ID,
      clientSecret: credentials.GITHUB_CLIENT_SECRET,
      callbackURL: credentials.GITHUB_CALLBACK_URL
    }, getUserInfo)
  )


  function getUserInfo(token, tokenSecret, profile, done){
    var user = new UserInfo(profile).toJSON()
    users.findOne({
      username: user.username,
      id:       user.id
    },function(err,doc){
      if( err ) return done(err,null)
      if( doc ) return done(null, doc)
      users.insert(user,function(err,doc){
        if( err ) return done(err,null)
        done(null,doc[0])
      })
    })
  }
}
