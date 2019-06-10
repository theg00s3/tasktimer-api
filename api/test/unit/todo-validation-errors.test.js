const test = require('ava')
const todoValidationErrors = require('../../modules/todo-validation-errors')

let result
test.beforeEach(() => (result = undefined))

test('returns "invalid" error', t => {
  result = todoValidationErrors(undefined)
  t.deepEqual(result, ['invalid'])
})
test('returns "unknown fields" error', t => {
  result = todoValidationErrors({ x: true, y: 'Function.prototype' })
  t.true(result.includes('unknown fields: x, y'))
})
test('returns "text" error', t => {
  result = todoValidationErrors({})
  t.true(result.includes('"text" needs to be a string (received undefined)'))
})
