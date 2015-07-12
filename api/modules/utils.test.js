var utils = require('./utils')
var expect = require('chai').expect

describe('utils', function() {
  it('should remove unnecessary fields from a pomodoro', function () {
    var cleanedPomodoro = utils.cleanPomodoro({'should_be_removed':true,'startedAt':123456789})
    expect(cleanedPomodoro).to.have.property('startedAt')
    expect(cleanedPomodoro).not.to.have.property('should_be_removed')
  })

})
