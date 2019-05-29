const { serial } = require('ava')
const fetch = require('node-fetch')
const PairPomodoro = require('../../models/PairPomodoro')

serial('get pair channel status (new channel)', async t => {
  await PairPomodoro.remove({ channel: '1' })
  const response = await fetch('http://localhost:3000/pair/1/status')
  t.is(response.status, 200)
  t.deepEqual(await response.json(), {})
})

serial('get pair channel status (existing channel)', async t => {
  await PairPomodoro.remove({ channel: '1' })
  await PairPomodoro.insert({ channel: '1' })
  const response = await fetch('http://localhost:3000/pair/1/status')
  t.is(response.status, 200)
  const body = await response.json()
  t.deepEqual(body.channel, '1')
})
