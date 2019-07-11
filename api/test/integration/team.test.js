const { serial: test } = require('ava')
const { get } = require('../../test-helpers')
const User = require('../../models/User')
const TeamPomodoro = require('../../models/TeamPomodoro')
const fakeUser = require('../fixtures/fake-user')
const authCookie = require('../../helpers/before-each-auth-cookie')
test.before(async t => { global.cookie = await authCookie(t) })
test.beforeEach(async () => {
  await User.remove({})
  await User.insert(fakeUser)
})

test('get team channel status (new channel)', async t => {
  await TeamPomodoro.remove({ channel: '1' })
  const response = await get('/team/1/status')
  t.is(response.status, 200)
  t.deepEqual(await response.json(), {})
})

test('get team channel status (existing channel)', async t => {
  await TeamPomodoro.remove({ channel: '1' })
  await TeamPomodoro.insert({ channel: '1' })
  const response = await get('/team/1/status')

  t.is(response.status, 200)
  const body = await response.json()
  t.deepEqual(body.channel, '1')
})
