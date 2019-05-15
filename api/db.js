const monk = require('monk')

console.log('process.env.NODE_ENV', process.env.NODE_ENV)
module.exports = monk(process.env.MONGO_URL)
