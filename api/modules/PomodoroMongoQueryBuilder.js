module.exports = function PomodoroMongoQueryBuilder(){
  if( !(this instanceof PomodoroMongoQueryBuilder)){
    return new PomodoroMongoQueryBuilder
  }
  var _user
    , _day

  this.withUser = function(user){
    _user = user
  }

  this.withDay = function(day){
    _day = day
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
