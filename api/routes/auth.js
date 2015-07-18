var router = require('express').Router()
  , passport = require('passport')

var DEV = process.env.ENV==='DEV'

console.log( '-- process.env.ENV', process.env.ENV )

var defaultRedirectRoutes = {failureRedirect: '/',successRedirect: '/'}

console.log( '-- DEV', DEV )
if( DEV ){
  router.use(require('./middlewares/fakeSession'))
  router.get('/fake', function(req,res){
    req.session.user_tmp = {"apikey":"fake","id":2662706,"avatar":"https://avatars.githubusercontent.com/u/2662706?v=3","username":"christian-fei","_id":"fake"}
    res.redirect('/')
  })
}

router.get('/twitter', passport.authenticate('twitter'))
router.get('/github', passport.authenticate('github'))

router.get('/twitter/callback',
  passport.authenticate('twitter', defaultRedirectRoutes))
router.get('/github/callback',
  passport.authenticate('github', defaultRedirectRoutes))

router.get('/info', function(req,res){
  !req.user ? res.writeHead(401) : res.json( req.user )
  res.end()
})

router.get('/logout', function(req,res){
  req.logout()
  req.session.destroy()
  res.redirect('/')
})

module.exports = router
