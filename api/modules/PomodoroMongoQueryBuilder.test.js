var expect = require('chai').expect
var PomodoroMongoQueryBuilder = require('./PomodoroMongoQueryBuilder')

describe("PomodoroMongoQueryBuilder", function() {
  var builder
  beforeEach(function () {
    builder = new PomodoroMongoQueryBuilder()
  })

  describe('builds a query', function () {
    it('withUser', function () {
      var user = {id: 1}
      builder.withUser(user)

      var result = builder.build()

      expect( result ).to.deep.eql({
        userId: user.id
      })
    })
  })
})
