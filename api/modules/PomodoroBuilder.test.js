var expect = require('chai').expect
var PomodoroBuilder = require('./PomodoroBuilder')

describe("PomodoroBuilder", function() {
  var builder

  beforeEach(function () {
    builder = new PomodoroBuilder()
  })

  it('#withUser', function () {
    var userId = 1
    builder.withUser(userId)
    var pomodoro = builder.build()

    expect( pomodoro ).to.deep.eql( {
      userId: userId
    } )
  })

  it('#withData', function () {
    var data = {
      minutes: 25,
      startedAt: '2015-08-19T19:34:14.235Z',
      type: 'pomodoro',
    }
    builder.withData(data)
    var pomodoro = builder.build()

    expect( pomodoro ).to.deep.eql( {
      minutes: 25,
      startedAt: new Date('2015-08-19T19:34:14.235Z'),
      type: 'pomodoro',
    } )
  })

})
