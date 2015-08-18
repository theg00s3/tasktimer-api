var moment = require('moment')

module.exports = {
  validate: validate
}

var propertyValidators = {
  minutes: validateMinutes,
  type: validateType,
}

function validate(pomodoro){
  var errors = {}
  for(var prop in propertyValidators){
    if( !hasProperty(pomodoro,prop) && /(tags)/.test(prop) ){
      continue
    }

    var rule = propertyValidators[prop]
    if( !rule(pomodoro[prop],pomodoro) )
      errors[prop] = "invalid"

    if( !hasProperty(pomodoro,prop) )
      errors[prop] = "required"
  }
  return errors
}

function hasProperty(pomodoro,prop){
  return pomodoro && pomodoro[prop] !== undefined
}

function inTimerange(timestamp,timespan){
  return timestamp<=timespan.max && timestamp>=timespan.min
}

function getPomodoroTimespan(pomodoro){
  return {
    min: pomodoro.startedAt,
    max: pomodoro.cancelledAt ? pomodoro.cancelledAt : pomodoro.startedAt+pomodoro.minutes*60*1000
  }
}


function parseToInt(number){
  return parseInt(number,10)
}

function inRange(number,min,max){
  return number>=min && number<=max
}

function validateIntegerRange(testValue,min,max){
  var _testValue = parseToInt(testValue)
  if( inRange(testValue,min,max) && _testValue === testValue )
    return _testValue
  return NaN
}


/* validators */
function validateSeconds(seconds){
  return validateIntegerRange(seconds,1,59)
}
function validateMinutes(minutes){
  return validateIntegerRange(minutes,1,25)
}
function validateType(type){
  return ['pomodoro','break','pomodoro-public','break-public'].indexOf(type)>=0
}