const { serial: test } = require('ava')
const monk = require('monk')
const fetch = require('node-fetch')
const User = require('../../models/User')
const Pomodoro = require('../../models/Pomodoro')

test.beforeEach(async () => {
  await Pomodoro.remove({})
  await User.remove({})
  await User.insert({
    '_id': '5a9fe4e085d766000c002636',
    'apikey': 'xxx',
    'id': '2662706',
    'avatar': 'https://avatars0.githubusercontent.com/u/2662706?v=4',
    'username': 'christian-fei'
  })
})

test('api', async t => {
  const response = await fetch('http://localhost:3000/api')
  t.is(response.status, 200)
})

test('save pomodoro', async t => {
  let response, cookie
  response = await fetch('http://localhost:3000/user/fake', { credentials: true })
  t.is(response.status, 200)
  cookie = response.headers.get('set-cookie')
  t.truthy(cookie)

  const pomodoro = { minutes: 25, type: 'pomodoro', startedAt: new Date() }
  response = await fetch('http://localhost:3000/pomodoros', {
    method: 'POST',
    json: true,
    body: JSON.stringify(pomodoro),
    credentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      cookie
    }
  })

  const json = await response.json()
  t.is(response.status, 200)
  t.is(json.minutes, 25)
  t.true(new Date(json.startedAt) < new Date())
  t.is(json.type, 'pomodoro')
  t.truthy(json._id)
  t.truthy(json.userId)
})

test('retrieve pomodoros', async t => {
  const pomodoro = { '_id': monk.id('5cf6c7ff8985d5f68443f7e3'), 'minutes': 25, 'type': 'pomodoro', 'startedAt': '2019-06-04T19:35:27.255Z', 'userId': monk.id('5a9fe4e085d766000c002636') }
  await Pomodoro.insert(pomodoro)

  let response, cookie
  response = await fetch('http://localhost:3000/user/fake', { credentials: true })
  t.is(response.status, 200)
  cookie = response.headers.get('set-cookie')
  t.truthy(cookie)

  response = await fetch('http://localhost:3000/pomodoros', {
    method: 'GET',
    json: true,
    credentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      cookie
    }
  })

  const json = await response.json()
  t.truthy(json)
  t.is(response.status, 200)
  t.is(json.length, 1)
  t.is(json[0].minutes, 25)
  t.true(new Date(json[0].startedAt) < new Date())
  t.is(json[0].type, 'pomodoro')
  t.truthy(json[0]._id)
  t.truthy(json[0].userId)
})
