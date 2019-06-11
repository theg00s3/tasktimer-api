const api = require('../app')
const Event = require('../models/Event')

module.exports = api

api.get('/user/info', async (req, res) => {
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }
  res.json(req.user)
  await Event.insert({ name: 'userAuthenticated', createdAt: new Date(), user: { _id: req.user._id, username: req.user.username } }).catch(Function.prototype)
})
api.get('/user/logout', (req, res) => {
  req.logout()
  res.end()
})
