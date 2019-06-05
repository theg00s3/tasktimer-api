var monk = require('monk')
var url = require('url')

module.exports = function PomodoroQueryBuilder () {
  if (!(this instanceof PomodoroQueryBuilder)) {
    return new PomodoroQueryBuilder()
  }
  var _user,
    _day,
    _id,
    _timerangeStart,
    _timerangeEnd

  this.withUser = function (user) {
    _user = user
    return this
  }

  this.withDay = function (day) {
    _day = day
    return this
  }

  this.withId = function (id) {
    _id = id
    return this
  }

  this.withRequest = function (req) {
    var query = url.parse(req.url, true).query
    this
      .withUser(req.user)
      .withDay(query.day)
    return this
  }

  this.withinTimerange = function (timerangeStart, timerangeEnd) {
    _timerangeStart = timerangeStart
    _timerangeEnd = timerangeEnd
    return this
  }

  this.withinTimerangeOf = function (pomodoro) {
    var timerangeStart = pomodoro.startedAt
    var timerangeEnd = pomodoro.cancelledAt
    if (!timerangeEnd) {
      timerangeEnd = new Date(pomodoro.startedAt)
      timerangeEnd.setMinutes(timerangeEnd.getMinutes() + pomodoro.minutes)
    }
    return this.withinTimerange(timerangeStart, timerangeEnd)
  }

  this.build = function () {
    var result = {}

    if (_user && _user._id) {
      result.userId = monk.id(_user._id)
    }

    if (_day) {
      result.startedAt = {
        $gte: calculateStartDay(_day),
        $lt: calculateEndDay(_day)
      }
    }

    if (_timerangeStart && _timerangeEnd) {
      result.startedAt = {
        $gte: new Date(_timerangeStart),
        $lt: new Date(_timerangeEnd)
      }
    }

    if (_id) {
      try {
        result._id = monk.id(_id)
      } catch (e) {
      }
    }

    return result
  }

  function calculateStartDay (_day) {
    return new Date(_day)
  }
  function calculateEndDay (_day) {
    var endDate = new Date(_day)
    endDate.setDate(endDate.getDate() + 1)
    return endDate
  }
}
