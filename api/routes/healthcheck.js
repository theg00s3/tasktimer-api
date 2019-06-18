const { Router } = require('express')
const healthcheck = new Router()
const healthcheckFactory = require('./healthcheck-factory')

healthcheck.use(healthcheckFactory)

module.exports = healthcheck
