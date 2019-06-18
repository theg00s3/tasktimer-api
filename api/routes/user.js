const user = require('../app')
const userFactory = require('./user-factory')

user.use(userFactory)

module.exports = user
