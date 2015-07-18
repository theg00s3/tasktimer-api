var router = require('express').Router()

module.exports = router
  .use('/api', require('./api'))
  .use('/auth', require('./auth'))