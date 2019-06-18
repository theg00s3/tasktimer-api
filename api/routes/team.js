const team = require('../app')
const teamFactory = require('./team-factory')

team.use(teamFactory)

module.exports = team
