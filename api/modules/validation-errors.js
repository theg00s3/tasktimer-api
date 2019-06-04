module.exports = function validationErrors (pomodoro) {
  if (!pomodoro) return ['invalid']
  const errors = []
  if (!Number.isFinite(pomodoro.minutes)) errors.push(`"minutes" needs to be a number (received ${pomodoro.minutes})`)
  if (!['break', 'pomodoro', 'custom'].includes(pomodoro.type)) errors.push(`"type" needs to be either "break", "pomodoro" or "custom" (received ${pomodoro.type})`)
  if (!pomodoro.startedAt) errors.push(`"startedAt" needs to be a date (received ${pomodoro.startedAt})`)
  return errors.length === 0 ? null : errors
}
