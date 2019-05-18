const monk = require('monk')

console.log('process.env.NODE_ENV', process.env.NODE_ENV)
console.log('MONGO_URL set?', !!process.env.MONGO_URL)
module.exports = monk(process.env.MONGO_URL)
