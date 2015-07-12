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
    it('withDay', function () {      
      var day = '07/12/2015'
      builder.withDay(day)
      var result = builder.build()

      expect( result ).to.deep.eql({
        startedAt: {
          $gte: new Date('07/12/2015'),
          $lt: new Date('07/13/2015'),
        }
      })
    })
    it('withId', function () {
      var id = 1
      builder.withId(id)

      var result = builder.build()

      expect( result._id ).to.be.ok
      expect( result._id.toHexString() ).to.be.ok
    })
    
    it('can be chained', function () {
        var user = {id: 1}
        var day = '07/12/2015'
        builder
          .withUser(user)
          .withDay(day)    
          
      var result = builder.build()

      expect( result ).to.deep.eql({
        userId: user.id,
        startedAt: {
          $gte: new Date('07/12/2015'),
          $lt: new Date('07/13/2015'),
        }
      })
    })
  })
})
