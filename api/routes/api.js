const api = require('../app')
const apiFactory = require('./api-factory')

api.use(apiFactory)

module.exports = api
