var BSON = require('mongodb').BSONPure

module.exports = function PomodoroMongoQueryBuilder(){
  if( !(this instanceof PomodoroMongoQueryBuilder)){
    return new PomodoroMongoQueryBuilder
  }
  var _user
    , _day
    , _id

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

  this.build = function(){
    var result = {}

    if( _user && _user.id ){
      result.userId = _user.id
    }

    if( _day ){
      result.startedAt = {
        $gte: getStartDay(_day),
        $lt: getEndDay(_day),
      }
    }

    if( _id ){
      var pomodoroId
      try {
        result.id = new BSON.ObjectID(_id)
      }catch(e){}
    }

    return result
  }

  function getStartDay(_day){
    return new Date(_day)
  }
  function getEndDay(_day){
    var endDate = new Date(_day)
    endDate.setDate(endDate.getDate()+1)
    return endDate
  }
}
