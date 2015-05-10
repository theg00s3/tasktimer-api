var chai = require('chai')
, sinon = require('sinon')
, expect = chai.expect
chai.use(require("sinon-chai"))

var FakeSocket = require('./fake/FakeSocket')
  , fakeSocket = new FakeSocket()

var Rooms = require('../../modules/Rooms')
  , rooms = new Rooms()

var SocketIOBehaviour = require('../../modules/SocketIOBehaviour')

var room = 'room-1'

var spies = {
  on: sinon.spy(fakeSocket, 'on'),
  emit: sinon.spy(fakeSocket, 'emit'),
  join: sinon.spy(fakeSocket, 'join'),
  to: sinon.spy(fakeSocket, 'to'),
}



describe('SocketIOBehaviour', function () {
  beforeEach(function() {
    SocketIOBehaviour(rooms)(fakeSocket)
  })

  afterEach(function(){
    spies.on.reset()
  })

  it('registers callback functions', function () {
    expect(spies.on).to.have.been.calledWith('room')
    expect(spies.on).to.have.been.calledWith('pomodoroSyncResponse')
    expect(spies.on).to.have.been.calledWith('start')
    expect(spies.on).to.have.been.calledWith('stop')
    expect(spies.on).to.have.been.calledWith('event')
    expect(spies.on).to.have.been.calledWith('disconnect')
  })

  it('joins the room', function () {
    fakeSocket.emitEvent('room', room)
    expect(spies.join).to.have.been.calledWith(room)
    expect(spies.to).to.have.been.calledWith(room)
  })

  it('emits the clientsCount', function () {
    fakeSocket.emitEvent('room', room)
    expect(spies.emit).to.have.been.calledWith('clientsCount')
  })
})
