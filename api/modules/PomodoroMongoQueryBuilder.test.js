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

    it('withRequest', function () {
      builder.withRequest({
        url: '?day=01/01/2015',
        user: {
          id: 123456
        },
        params: {
          id: 1
        }
      })

      var result = builder.build()

      expect( result.startedAt ).to.deep.eql({
        $gte: new Date('2015-01-01T00:00:00.000Z'),
        $lt: new Date('2015-01-02T00:00:00.000Z'),
      })
      expect( result.userId ).to.eql( 123456 )
      expect( result._id ).to.be.ok
      expect( result._id.toHexString() ).to.be.ok
    })

    it('withinTimerange', function () {
      var timerangeStart = '2015-07-12T08:00:00Z'
      var timerangeEnd = '2015-07-12T09:00:00Z'
      builder.withinTimerange(timerangeStart, timerangeEnd)
      var result = builder.build()

      expect( result ).to.deep.eql({
        startedAt: {
          $gte: new Date('2015-07-12T08:00:00Z'),
          $lt: new Date('2015-07-12T09:00:00Z'),
        }
      })
    })

    describe('withinTimerangeOf', function () {
      it('of cancelled pomodoro', function () {
        builder.withinTimerangeOf({
          startedAt: '2015-07-12T08:00:00Z',
          cancelledAt: '2015-07-12T08:15:26Z',
          minutes: 25,
          type: 'pomodoro'
        })
        var result = builder.build()

        expect( result ).to.deep.eql({
          startedAt: {
            $gte: new Date('2015-07-12T08:00:00Z'),
            $lt: new Date('2015-07-12T08:15:26Z'),
          }
        })
      })
      it('of a full pomodoro', function () {
        builder.withinTimerangeOf({
          startedAt: '2015-07-12T08:00:00Z',
          minutes: 25,
          type: 'pomodoro'
        })
        var result = builder.build()

        expect( result ).to.deep.eql({
          startedAt: {
            $gte: new Date('2015-07-12T08:00:00Z'),
            $lt: new Date('2015-07-12T08:25:00Z'),
          }
        })
      })
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
