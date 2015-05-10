/*
  http://afshinm.name/mongodb-singleton-connection-in-nodejs
*/

var config = require('config');

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

var connectionInstance;

module.exports = function(callback) {
  if (connectionInstance) {
    callback(connectionInstance);
    return;
  }

  var db = new Db('pomodoro', new Server(config.get('mongodb.host'), Connection.DEFAULT_PORT, { auto_reconnect: true }),{ fsync:true });
  db.open(function(error, databaseConnection) {
    if (error) throw new Error(error);
    connectionInstance = databaseConnection;
    callback(databaseConnection);
  });
};
