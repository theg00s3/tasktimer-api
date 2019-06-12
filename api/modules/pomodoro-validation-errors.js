const allowedFields = ['id', '_id', 'startedAt', 'createdAt', 'completed', 'completedAt', 'completedAt', 'cancelled', 'type', 'minutes', 'team']

module.exports = function pomodoroValidationErrors (pomodoro) {
  if (!pomodoro) return ['invalid']
  const errors = []
  const unknownFields = Object.keys(pomodoro).filter(key => !allowedFields.includes(key))
  if (unknownFields.length > 0) errors.push(`unknown fields: ${unknownFields.join(', ')}`)
  if (!Number.isFinite(pomodoro.minutes)) errors.push(`"minutes" needs to be a number (received ${pomodoro.minutes})`)
  if (!['break', 'pomodoro', 'custom'].includes(pomodoro.type)) errors.push(`"type" needs to be either "break", "pomodoro" or "custom" (received ${pomodoro.type})`)
  if (!pomodoro.startedAt) errors.push(`"startedAt" needs to be a date (received ${pomodoro.startedAt})`)
  return errors.length === 0 ? null : errors
}
