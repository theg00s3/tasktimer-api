var monk = require('monk')
var url = require('url')
var dayjs = require('dayjs')
var weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(weekOfYear)

module.exports = function TodoQueryBuilder () {
  if (!(this instanceof TodoQueryBuilder)) {
    return new TodoQueryBuilder()
  }

  this.withUser = function (user) {
    this.user = user
    return this
  }

  this.withDay = function (day) {
    if (day) this.day = day
    return this
  }
  this.withFrom = function (from) {
    if (from) this.from = from
    return this
  }
  this.withTo = function (to) {
    if (to) this.to = to
    return this
  }
  this.withWeek = function (week) {
    if (week) this.week = week
    return this
  }

  this.withId = function (_id) {
    this._id = _id
    return this
  }

  this.withRequest = function (req) {
    var query = url.parse(req.url, true).query
    this
      .withUser(req.user)
      .withDay(query.day)
      .withFrom(query.from)
      .withTo(query.to)
      .withWeek(req.params.week)
    return this
  }

  this.build = function () {
    var result = {}

    if (this.user && this.user._id) {
      result.userId = monk.id(this.user._id)
    }

    if (this.day) {
      result.createdAt = {
        $gte: calculateStartDay(this.day),
        $lt: calculateEndDay(this.day)
      }
    }

    if (this.from && this.to) {
      result.createdAt = {
        $gte: calculateStartDay(this.from),
        $lt: calculateEndDay(this.to)
      }
      console.log('result', result)
    }
    if (this.week) {
      result.createdAt = {
        $gte: calculateStartDayFromWeek(this.week),
        $lt: calculateEndDayFromWeek(this.week)
      }
    }

    if (this._id) {
      try {
        result.this._id = monk.id(this._id)
      } catch (e) {
      }
    }

    return result
  }

  function calculateStartDay (day) {
    const startDay = new Date(day)
    startDay.setHours(0)
    return startDay
  }
  function calculateEndDay (day) {
    var endDay = new Date(day)
    endDay.setHours(0)
    endDay.setDate(endDay.getDate() + 1)
    return endDay
  }
}
function calculateStartDayFromWeek (week) {
  const x = dayjs().week(week).startOf('week').toDate()
  return new Date(x)
}
function calculateEndDayFromWeek (week) {
  return dayjs().week(week).endOf('week').toDate()
}
