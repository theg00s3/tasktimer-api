const { serial } = require('ava')
const fetch = require('node-fetch')
const TeamPomodoro = require('../../models/TeamPomodoro')

serial.skip('get team channel status (new channel)', async t => {
  await TeamPomodoro.remove({ channel: '1' })
  const response = await fetch('http://localhost:3000/team/1/status')
  t.is(response.status, 200)
  t.deepEqual(await response.json(), {})
})

serial.skip('get team channel status (existing channel)', async t => {
  await TeamPomodoro.remove({ channel: '1' })
  await TeamPomodoro.insert({ channel: '1' })
  const response = await fetch('http://localhost:3000/team/1/status')
  t.is(response.status, 200)
  const body = await response.json()
  t.deepEqual(body.channel, '1')
})
