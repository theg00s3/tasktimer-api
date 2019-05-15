const { serial } = require('ava')
const fetch = require('node-fetch')
const PairPomodoro = require('../models/PairPomodoro')

serial('healthcheck', async t => {
  const response = await fetch('http://localhost:3000/healthcheck')
  t.is(response.status, 200)
})

serial('unauthorized response', async t => {
  const response = await fetch('http://localhost:3000/info')
  t.is(response.status, 401)
})

serial('get pair channel status (new channel)', async t => {
  await PairPomodoro.remove({ channel: '1' })
  const response = await fetch('http://localhost:3000/pair/1')
  t.is(response.status, 200)
  t.is(await response.json(), null)
})

serial('get pair channel status (existing channel)', async t => {
  await PairPomodoro.remove({ channel: '1' })
  await PairPomodoro.insert({ channel: '1' })
  const response = await fetch('http://localhost:3000/pair/1')
  t.is(response.status, 200)
  const body = await response.json()
  t.deepEqual(body.channel, '1')
})

serial.skip('authorizes response with fake cookie', async t => {
  let response, cookie
  response = await fetch('http://localhost:3000/fake', { credentials: true })
  cookie = response.headers.get('set-cookie')
  t.is(response.status, 401)
  response = await fetch('http://localhost:3000/fake', { credentials: true, headers: { cookie } })
  t.is(response.status, 200)
})
