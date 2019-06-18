const subscriptions = require('../app')
const subscriptionsFactory = require('./subscriptions-factory')

subscriptions.use(subscriptionsFactory)

module.exports = subscriptions
