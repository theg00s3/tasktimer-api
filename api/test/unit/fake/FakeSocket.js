module.exports = FakeSocket

var util = require('util')
var events = require('events')

function FakeSocket(){
  events.EventEmitter.call(this)
}

util.inherits(FakeSocket, events.EventEmitter)

FakeSocket.prototype.emitEvent = function(event, data){
  this.emit(event, data)
}
FakeSocket.prototype.broadcast = FakeSocket.prototype
FakeSocket.prototype.join = function(){
  return this
}
FakeSocket.prototype.to = function(){
  return this
}
