const monk = require('monk')
const logger = require('pino')()

logger.info('process.env.NODE_ENV', process.env.NODE_ENV)
logger.info('MONGO_URL set?', !!process.env.MONGO_URL)
module.exports = monk(process.env.MONGO_URL)
