const test = require('ava')
const validationErrors = require('../../modules/validation-errors')

let result
test.beforeEach(() => (result = undefined))

test('returns "invalid" error', t => {
  result = validationErrors(undefined)
  t.deepEqual(result, ['invalid'])
})

test('returns "minutes", "type", "startedAt" error', t => {
  result = validationErrors({})
  t.deepEqual(result, [
    '"minutes" needs to be a number (received undefined)',
    '"type" needs to be either "break", "pomodoro" or "custom" (received undefined)',
    '"startedAt" needs to be a date (received undefined)'
  ])
})
