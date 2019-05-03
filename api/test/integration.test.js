const {serial} = require('ava')
const request = require('r2')

serial('unauthorized response', async t => {
  const response = await request.get('http://localhost:3000/info').response
  t.is(response.status, 401)
})

serial('authorizes response with fake cookie', async t => {
  let response, cookie
  response = await request.get('http://localhost:3000/fake', {credentials: true}).response
  cookie = response.headers.get('set-cookie')
  t.is(response.status, 401)
  response = await request.get('http://localhost:3000/fake', {credentials: true, headers: {cookie}}).response
  t.is(response.status, 200)
})
