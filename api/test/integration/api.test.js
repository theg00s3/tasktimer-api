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

serial.skip('api', async t => {
  const response = await fetch('http://localhost:3000/api')
  t.is(response.status, 200)
})
serial.skip('save pomodoro', async t => {
  let response, cookie
  response = await fetch('http://localhost:3000/fake', { credentials: true })
  t.is(response.status, 200)
  cookie = response.headers.get('set-cookie')
  t.truthy(cookie)
  console.log('cookie', cookie)

  const body = {}
  response = await fetch('http://localhost:3000/api/pomodoro', {
    method: 'POST',
    json: true,
    body,
    credentials: true,
    headers: {
      // 'Accept': 'application/json',
      // 'Content-Type': 'application/json',
      cookie
    }
  })
  // const json = await response.json()
  // console.log('json', json)
  // console.log('response', response)
  t.is(response.status, 200)
})
