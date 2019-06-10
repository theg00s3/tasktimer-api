const test = require('ava')
const pomodoroValidationErrors = require('../../modules/pomodoro-validation-errors')

let result
test.beforeEach(() => (result = undefined))

test('returns "invalid" error', t => {
  result = pomodoroValidationErrors(undefined)
  t.deepEqual(result, ['invalid'])
})
test('returns "unknown fields" error', t => {
  result = pomodoroValidationErrors({ x: true, y: 'Function.prototype' })
  t.true(result.includes('unknown fields: x, y'))
})
test('returns "minutes", "type", "startedAt" error', t => {
  result = pomodoroValidationErrors({})
  t.deepEqual(result, [
    '"minutes" needs to be a number (received undefined)',
    '"type" needs to be either "break", "pomodoro" or "custom" (received undefined)',
    '"startedAt" needs to be a date (received undefined)'
  ])
})
