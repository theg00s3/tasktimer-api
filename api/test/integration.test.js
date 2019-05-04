const { serial } = require('ava')
const fetch = require('node-fetch')

serial('healthcheck', async t => {
  const response = await fetch('http://localhost:3000/healthcheck')
  t.is(response.status, 200)
})

serial('unauthorized response', async t => {
  const response = await fetch('http://localhost:3000/info')
  t.is(response.status, 401)
})

serial.skip('authorizes response with fake cookie', async t => {
  let response, cookie
  response = await fetch('http://localhost:3000/fake', { credentials: true })
  cookie = response.headers.get('set-cookie')
  t.is(response.status, 401)
  response = await fetch('http://localhost:3000/fake', { credentials: true, headers: { cookie } })
  t.is(response.status, 200)
})
