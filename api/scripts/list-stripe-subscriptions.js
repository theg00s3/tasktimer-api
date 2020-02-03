#!/usr/bin/env node

require('../env')
console.log('process.env.MONGO_URL', process.env.MONGO_URL)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const User = require('../models/User')

if (require.main === module) {
  main()
    .then(res => {
      console.log(res)
      process.exit(0)
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
module.exports = getSubscription

async function getSubscription (id) {
  return new Promise((resolve, reject) => {
    stripe.subscriptions.retrieve(id, (err, subscription) => {
      if (err) return reject(err)
      resolve(subscription)
    })
  })
}
async function main () {
  await User.find({ subscription: { $exists: true } }, { sort: { 'subscription.created': -1 } }).each(async (doc, { pause, resume }) => {
    if (doc.subscription && doc.subscription.id && doc.customer && doc.customer.id) {
      pause()
      const subscription = await getSubscription(doc.subscription.id)
      console.log('------------------------------------------------------------------')
      // console.log('(user)', JSON.stringify(doc))
      console.log('user._id', doc._id)
      console.log('user.username', doc.username)
      console.log('user.customer.email', doc.customer.email)
      console.log('subscription.id', subscription.id)
      console.log('subscription.status', subscription.status)
      console.log('subscription.created', new Date(subscription.created * 1000).toISOString())
      console.log('subscription.current_period_start', new Date(subscription.current_period_start * 1000).toISOString())
      console.log('subscription.current_period_end', new Date(subscription.current_period_end * 1000).toISOString())
      console.log('------------------------------------------------------------------')
      resume()
    }
  })
}
