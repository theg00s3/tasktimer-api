module.exports = function PomodoroMongoQueryBuilder(){
  if( !(this instanceof PomodoroMongoQueryBuilder)){
    return new PomodoroMongoQueryBuilder
  }
  var _user

  this.withUser = function(user){
    _user = user
  }

  this.build = function(){
    var result = {}

    if( _user && _user.id ){
      result.userId = _user.id
    }

    return result
  }
}
