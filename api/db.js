if (!process.env.NOW_REGION) { require('dotenv').config() }

const monk = require('monk')

module.exports = monk(process.env.MONGO_URL)
