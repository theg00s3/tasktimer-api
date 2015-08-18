var router = require('express').Router()

if( process.env.ENV==='DEV' || process.env.NODE_ENV==='test' ){
  router.use('/auth', require('./helpers/fakeSession'))
}

router
  .use('/api', require('./api'))
  .use('/auth', require('./auth'))


module.exports = router