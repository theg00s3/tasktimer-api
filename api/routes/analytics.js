const analytics = require('../app')
const analyticsFactory = require('./analytics-factory')

analytics.use(analyticsFactory)

module.exports = analytics
