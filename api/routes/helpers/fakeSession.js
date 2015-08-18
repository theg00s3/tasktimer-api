var router = require('express').Router()

router.use(fakeSessionHandler)
router.get('/fake', fakeAuth)

module.exports = router




var fakeUser = {"apikey":"fake","id":2662706,"avatar":"https://avatars.githubusercontent.com/u/2662706?v=3","username":"christian-fei","_id":"fake"}

function fakeSessionHandler(req,res,next){
  if( req && req.session && req.session.userTmp ){
    req.user = req.session.userTmp
  }
  next()
}

function fakeAuth(req,res){
  if( !req.session ) { req.session = {} }
  req.session.userTmp = fakeUser
  res.redirect('/')
}