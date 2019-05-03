module.exports = {
  middleware: middleware,
  route: route
}

var fakeUser = {'apikey': 'fake', 'id': 2662706, 'avatar': 'https://avatars.githubusercontent.com/u/2662706?v=3', 'username': 'christian-fei', '_id': 'fake'}

function middleware (req, res, next) {
  setUser(req)
  next && next()

  function setUser (req) {
    if (req && req.session && req.session.user_tmp) { req.user = req.session.user_tmp }
  }
}

function route (req, res) {
  setTempUser(req)
  res.redirect('/info')

  function setTempUser (req) {
    if (!req.session) { req.session = {} }
    req.session.user_tmp = fakeUser
  }
}
