var _ = require('underscore')
module.exports = function PomodoroBuilder(){
  if( !(this instanceof PomodoroBuilder)){
    return new PomodoroBuilder
  }

  var userId
    , data

  this.withUser = function(_userId){
    userId = _userId
    return this
  }

  this.withData = function(_data){
    data = _data
    return this
  }

  this.build = function(){
    var pomodoro = {}

    if( userId !== undefined ){
      pomodoro.userId = userId
    }

    if( data !== undefined ){
      var rawData = _.pick(data,'startedAt','minutes','type','tags','distractions','cancelledAt')
      rawData.startedAt = new Date(rawData.startedAt)
      if( rawData.cancelledAt ){
        rawData.cancelledAt = new Date(rawData.cancelledAt)
      }
      pomodoro = _.extend(pomodoro, rawData)
    }

    return pomodoro
  }
}
