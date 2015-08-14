var url = require('url')

module.exports = function(db, usersCollectionName){
  var users
  db(function(conn){
    users = conn.collection(usersCollectionName)
  })

  return function(req, res, next){
    if( req.user ) return next()
    var query = url.parse(req.url, true).query
    if( query.apikey === undefined ) return res.sendStatus(401)
    users.findOne({
      apikey: query.apikey
    }, function(err,user){
      if( err || !user ) {
        return res.sendStatus(401)
      }
      req.user = user
      next()
    })
  }
}