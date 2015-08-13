module.exports = function(router){
  router.use(fakeSessionHandler)
  router.get('/auth/fake', fakeSessionRoute)
}

var fakeUser = {"apikey":"fake","id":2662706,"avatar":"https://avatars.githubusercontent.com/u/2662706?v=3","username":"christian-fei","_id":"fake"}

function fakeSessionHandler(req,res,next){
  if( req && req.session && req.session.user_tmp ){
    req.user = req.session.user_tmp
  }
  if( next ){
    next()
  }
}

function fakeSessionRoute(req,res){
  if( !req.session ) { req.session = {} }
  req.session.user_tmp = fakeUser
  res.redirect('/')
}