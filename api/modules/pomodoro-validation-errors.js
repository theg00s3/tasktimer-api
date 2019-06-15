const allowedFields = ['id', '_id', 'startedAt', 'createdAt', 'completed', 'completedAt', 'completedAt', 'cancelled', 'cancelledAt', 'cancelled_at', 'type', 'minutes', 'team', 'recreated']

module.exports = function pomodoroValidationErrors (pomodoro) {
  if (!pomodoro) return ['invalid']
  const errors = []
  const unknownFields = Object.keys(pomodoro).filter(key => !allowedFields.includes(key))
  if (unknownFields.length > 0) errors.push(`unknown fields: ${unknownFields.join(', ')}`)
  if (!Number.isFinite(pomodoro.minutes)) errors.push(`"minutes" needs to be a number (received ${pomodoro.minutes})`)
  if (!['break', 'pomodoro', 'custom'].includes(pomodoro.type)) errors.push(`"type" needs to be either "break", "pomodoro" or "custom" (received ${pomodoro.type})`)
  if (!pomodoro.startedAt) errors.push(`"startedAt" needs to be a date (received ${pomodoro.startedAt})`)
  if (pomodoro.cancelledAt && !new Date(pomodoro.cancelledAt)) errors.push(`"cancelledAt" needs to be a date (received ${pomodoro.cancelledAt})`)
  if (pomodoro.cancelled_at && new Date(pomodoro.cancelled_at)) {
    Object.assign(pomodoro, { cancelledAt: new Date(pomodoro.cancelled_at) })
    delete pomodoro.cancelled_atå
  }
  return errors.length === 0 ? null : errors
}
