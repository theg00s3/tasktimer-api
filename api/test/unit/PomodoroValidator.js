var expect = require('chai').expect
var PomodoroValidator = require('../../modules/PomodoroValidator')

describe("PomodoroValidator", function() {

  var invalid = {
    minutes: -1,
    startedAt: Date.now() + 100000,
    type: 'invalid',
    week: '2013/123',
    tags: null,
  }

  var valid = {
    minutes: 25,
    startedAt: Date.now() - 100000,
    type: 'pomodoro',
    day: '07/12/2014',
    week: '42/2014',
    tags: [],
    distractions: [],
  }

  var invalidPomodoro

  var validPomodoro

  beforeEach(function(){
    invalidPomodoro  = {
      minutes: invalid.minutes,
      startedAt: invalid.startedAt,
      type: invalid.type,
      tags: invalid.tags,
      distractions: invalid.distractions,
    }
    validPomodoro = {
      minutes: valid.minutes,
      startedAt: valid.startedAt,
      type: valid.type,
      tags: valid.tags,
      distractions: valid.distractions,
    }
  })

  it("invalid pomodoro", function() {
    var errors = PomodoroValidator.validate(invalidPomodoro)
    expect(errors).to.deep.equal({
      distractions: 'required',
      tags: 'invalid',
      minutes: 'invalid',
      type: 'invalid',
    })
  })

  it("valid pomodoro", function() {
    expect(PomodoroValidator.validate(validPomodoro)).to.deep.equal({})
  })

  it("invalid pomodoro if distractions are out of pomodoro timespan", function() {
    validPomodoro.distractions = [validPomodoro.startedAt+100*60*1000]
    expect(PomodoroValidator.validate(validPomodoro)).to.deep.equal({
      distractions:'invalid'
    })
  })

  it("returns errors for required property", function() {
    var errors = PomodoroValidator.validate({})
    expect(errors).to.deep.equal({
      distractions:'required',
      minutes:'required',
      tags:'required',
      type:'required',
    })
  })

})
