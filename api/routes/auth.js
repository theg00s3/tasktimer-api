var router = require('express').Router()
  , passport = require('passport')


router.get('/twitter', passport.authenticate('twitter'))
router.get('/github', passport.authenticate('github'))

router.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' ,successRedirect: '/'}))
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/' ,successRedirect: '/'}))

router.get('/info', function(req,res){
  !req.user ? res.writeHead(401) : res.json( req.user )
  res.end()
})

router.get('/logout', function(req,res){
  req.logout()
  res.redirect('/')
})

module.exports = router
