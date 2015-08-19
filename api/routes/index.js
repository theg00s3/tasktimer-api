var router = require('express').Router()


if( process.env.ENV==='DEV' || process.env.NODE_ENV==='test' ){
  var fakeSession = require('./helpers/fakeSession')
  router.use(fakeSession.middleware)
  router.get('/auth/fake', fakeSession.route)
}

module.exports = router
  .use('/api', require('./api'))
  .use('/auth', require('./auth'))