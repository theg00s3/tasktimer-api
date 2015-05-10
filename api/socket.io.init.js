var socketIO = require('socket.io')
var Rooms = require('./modules/Rooms')
var rooms = new Rooms()
var SocketIOBehaviour = require('./modules/SocketIOBehaviour')

module.exports = function(server){
  var io = socketIO(server)
  io.on('connection', SocketIOBehaviour(rooms))
}
