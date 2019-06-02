const api = require('../app')

module.exports = api

api.get('/user/info', (req, res) => {
  console.log('req.user', req.user)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }
  res.json(req.user)
})
api.get('/user/logout', (req, res) => {
  console.log('req.user', req.user)
  req.logout()
  res.end()
})

if (process.env.NODE_ENV !== 'production') {
  api.get('/user/fake', (req, res) => {
    console.log('req.user', req.user)
    const user = {
      '_id': '5a9fe4e085d766000c002636',
      'apikey': 'xxx',
      'id': '2662706',
      'avatar': 'https://avatars0.githubusercontent.com/u/2662706?v=4',
      'username': 'christian-fei'
    }
    req.user = user
    res.json(user)
  })
}
