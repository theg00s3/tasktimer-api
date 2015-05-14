var moment = require('moment')
var TagsValidator = require('./TagsValidator');

module.exports = {
  validate: validate
};

var propertyValidators = {
  minutes: validateMinutes,
  // startedAt: validateStartedAt,
  type: validateType,
  // day: validateDay,
  // week: validateWeek,
  tags: validateTags,
  distractions: validateDistractions,
};

function validate(pomodoro){
  var errors = {};
  for(var prop in propertyValidators){
    var rule = propertyValidators[prop];
    if( !rule(pomodoro[prop],pomodoro) )
      errors[prop] = "invalid"

    if( !hasProperty(pomodoro,prop) )
      errors[prop] = "required"
  }
  return errors;
};

function hasProperty(pomodoro,prop){
  return pomodoro && pomodoro[prop] !== undefined;
}

function inTimerange(timestamp,timespan){
  return timestamp<timespan.max && timestamp>timespan.min;
}

function getPomodoroTimespan(pomodoro){
  return {
    min: pomodoro.startedAt,
    max: pomodoro.cancelledAt ? pomodoro.cancelledAt : pomodoro.startedAt+pomodoro.minutes*60*1000
  }
}


function parseToInt(number){
  return parseInt(number,10);
}

function inRange(number,min,max){
  return number>=min && number<=max;
}

function validateIntegerRange(testValue,min,max){
  var _testValue = parseToInt(testValue);
  if( inRange(testValue,min,max) && _testValue === testValue )
    return _testValue;
  return NaN;
}


/* validators */
function validateSeconds(seconds){
  return validateIntegerRange(seconds,1,59)
};
function validateMinutes(minutes){
  return validateIntegerRange(minutes,1,25)
};
function validateStartedAt(startedAt){
  return startedAt < Date.now();
}
function validateType(type){
  return ['pomodoro','break','pomodoro-public','break-public'].indexOf(type)>=0;
}
function validateDay(day){
  return moment(day,'DD/MM/YYYY').isValid();
}
function validateWeek(week){
  return moment(week,'W/GGGG').isValid();
}
function validateTags(tags){
  return TagsValidator.validate(tags);
}
function validateDistractions(distractions,pomodoro){
  if( !distractions || !distractions instanceof Array )
    return false;
  var timespan = getPomodoroTimespan(pomodoro);
  for (var i = 0; i < distractions.length; i++) {
    var d = distractions[i];
    if( !inTimerange(d,timespan) ) return false;
  };
  return true;
}
