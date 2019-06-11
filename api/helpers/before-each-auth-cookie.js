const fetch = require('node-fetch')

let cookie

module.exports = async t => {
  const response = await fetch('http://localhost:3000/user/fake', { credentials: true })
  t.is(response.status, 200)
  cookie = response.headers.get('set-cookie')
  t.truthy(cookie)
  return cookie
}
