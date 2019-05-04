if (!process.env.NOW_REGION) { require('dotenv').config() }

const monk = require('monk')

// console.log('process.env.MONGO_URL', process.env.MONGO_URL)
module.exports = monk(process.env.MONGO_URL)
