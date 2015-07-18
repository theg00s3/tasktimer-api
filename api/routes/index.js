var router = require('express').Router()


if( process.env.ENV==='DEV' || process.env.NODE_ENV==='test' ){
  require('./helpers/fakeSession')(router)
}

module.exports = router
  .use('/api', require('./api'))
  .use('/auth', require('./auth'))