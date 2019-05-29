const { serial } = require('ava')
const fetch = require('node-fetch')

serial('api', async t => {
  const response = await fetch('http://localhost:3000/api')
  t.is(response.status, 200)
})
