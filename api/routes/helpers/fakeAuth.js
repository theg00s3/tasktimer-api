module.exports = function(req,res){
  if( !req.session ) { req.session = {} }
  req.session.user_tmp = {"apikey":"fake","id":2662706,"avatar":"https://avatars.githubusercontent.com/u/2662706?v=3","username":"christian-fei","_id":"fake"}
  res.redirect('/')
}