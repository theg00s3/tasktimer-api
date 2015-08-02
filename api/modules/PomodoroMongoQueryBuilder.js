var BSON = require('mongodb').BSONPure

module.exports = function PomodoroMongoQueryBuilder(){
  if( !(this instanceof PomodoroMongoQueryBuilder)){
    return new PomodoroMongoQueryBuilder
  }
  var _user
    , _day
    , _id
    , _timerangeStart
    , _timerangeEnd

  this.withUser = function(user){
    _user = user
    return this
  }

  this.withDay = function(day){
    _day = day
    return this
  }

  this.withId = function(id){
    _id = id
    return this
  }

  this.withinTimerange = function(timerangeStart, timerangeEnd) {
    _timerangeStart = timerangeStart
    _timerangeEnd = timerangeEnd
    return this
  }

  this.build = function(){
    var result = {}

    if( _user && _user.id ){
      result.userId = _user.id
    }

    if( _day ){
      result.startedAt = {
        $gte: calculateStartDay(_day),
        $lt: calculateEndDay(_day),
      }
    }

    if( _timerangeStart && _timerangeEnd ){
      result.startedAt = {
        $gte: new Date(_timerangeStart),
        $lt: new Date(_timerangeEnd)
      }
    }

    if( _id ){
      var pomodoroId
      try {
        result._id = new BSON.ObjectID(_id)
      }catch(e){
      }
    }

    return result
  }

  function calculateStartDay(_day){
    return new Date(_day)
  }
  function calculateEndDay(_day){
    var endDate = new Date(_day)
    endDate.setDate(endDate.getDate()+1)
    return endDate
  }
}
