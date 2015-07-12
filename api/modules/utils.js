var _ = require('underscore')
var moment = require('moment')
var constants = require('../constants')

module.exports = {
  trimDecimals: function(number,numberOfDecimals){
    var decimals = Math.pow(10,numberOfDecimals)
    return parseInt(number*decimals,10)/decimals
  },
  isPartial: function(pomodoro){
    return !!pomodoro.cancelledAt && pomodoro.cancelledAt>pomodoro.startedAt && (pomodoro.cancelledAt-pomodoro.startedAt)<25*60*1000
  },
  cleanPomodoro: function(rawPomodoro){
    var pomodoro = _.pick(rawPomodoro,'startedAt','minutes','type','tags','distractions','cancelledAt')
    return pomodoro
  }
}
