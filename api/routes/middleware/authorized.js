var url = require('url')
var User = require('../../models/User')

module.exports = function(req, res, next){
  if( req.user ){
    return next()
  }
  var query = url.parse(req.url, true).query
  if( query.apikey === undefined ){
    return res.sendStatus(401)
  }
  User.findOne({
    apikey: query.apikey
  }, function(err,user){
    if( err || !user ){
      return res.sendStatus(401)
    }
    req.user = user
    next()
  })
}