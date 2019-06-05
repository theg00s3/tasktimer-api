const { serial } = require('ava')
const fetch = require('node-fetch')
const User = require('../../models/User')

serial.beforeEach(async () => {
  const usersCount = await User.count()
  console.log('usersCount', usersCount)
  await User.remove({})
  await User.insert({
    '_id': '5a9fe4e085d766000c002636',
    'apikey': 'xxx',
    'id': '2662706',
    'avatar': 'https://avatars0.githubusercontent.com/u/2662706?v=4',
    'username': 'christian-fei'
  })
})

serial('api', async t => {
  const response = await fetch('http://localhost:3000/api')
  t.is(response.status, 200)
})
serial('save pomodoro', async t => {
  let response, cookie
  response = await fetch('http://localhost:3000/user/fake', { credentials: true })
  t.is(response.status, 200)
  cookie = response.headers.get('set-cookie')
  t.truthy(cookie)
  console.log('cookie', cookie)

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
