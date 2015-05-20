/*
  http://afshinm.name/mongodb-singleton-connection-in-nodejs
*/

var config = require('config')

var Db = require('mongodb').Db
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server

var conn

module.exports = function(callback) {
  if (conn) {
    return callback(conn)
  }

  var db = new Db('pomodoro', new Server(config.get('mongodb.host'), Connection.DEFAULT_PORT, { auto_reconnect: true }),{ fsync:true })
  db.open(function(error, _conn) {
    if (error) throw new Error(error)
    conn = _conn
    conn.on('close', function(){
      conn = undefined
    })
    callback(_conn)
  })
}
