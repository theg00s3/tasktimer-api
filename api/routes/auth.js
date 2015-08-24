var router = require('express').Router()
  , passport = require('passport')
var defaultRedirectRoutes = {failureRedirect: '/',successRedirect: '/'}

router.get('/twitter', passport.authenticate('twitter'))
router.get('/github', passport.authenticate('github'))

router.get('/twitter/callback',
  passport.authenticate('twitter', defaultRedirectRoutes))
router.get('/github/callback',
  passport.authenticate('github', defaultRedirectRoutes))

router.get('/info', function(req,res){
  if( req.user === undefined ){
    res.writeHead(401)
  }else{
    res.json( req.user )
  }
  res.end()
})

router.get('/logout', function(req,res){
  req.logout()
  req.session.destroy()
  res.redirect('/')
})

module.exports = router