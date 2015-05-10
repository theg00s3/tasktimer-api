var _ = require('underscore')

module.exports = function(pomodoro){
  return _.pick(pomodoro, 'startedAt', 'minutes', 'type')
}