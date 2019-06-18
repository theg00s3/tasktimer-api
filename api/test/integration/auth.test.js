const { serial: test } = require('ava')
const fetch = require('node-fetch')

test('unauthorized response', async t => {
  const response = await fetch('http://localhost:3000/user/info')
  t.is(response.status, 401)
})

test('authorizes response with fake cookie', async t => {
  let response, cookie
  response = await fetch('http://localhost:3000/user/fake', { credentials: true })
  cookie = response.headers.get('set-cookie')
  t.is(response.status, 200)
  response = await fetch('http://localhost:3000/user/info', { credentials: true, headers: { cookie } })
  t.is(response.status, 200)
  const user = await response.json()
  t.deepEqual(user, {
    _id: '5a9fe4e085d766000c002636',
    apikey: 'xxx',
    id: '2662706',
    avatar: 'https://avatars0.githubusercontent.com/u/2662706?v=4',
    username: 'christian-fei'
  })
})
