const api = require('../app')

module.exports = api

api.get('/user/info', (req, res) => {
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }
  res.json(req.user)
})
api.get('/user/logout', (req, res) => {
  req.logout()
  res.end()
})
