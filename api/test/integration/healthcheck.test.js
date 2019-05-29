const { serial } = require('ava')
const fetch = require('node-fetch')

serial('healthcheck', async t => {
  const response = await fetch('http://localhost:3000/healthcheck')
  t.is(response.status, 200)
})
