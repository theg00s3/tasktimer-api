#!/usr/bin/env node

require('../env')
console.log('process.env.MONGO_URL', process.env.MONGO_URL)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const monk = require('monk')
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
  await User.find({}).each(async (doc, { pause, resume }) => {
    if (doc.subscription && doc.subscription.id) {
      pause()
      const subscription = await getSubscription(doc.subscription.id)
      console.log('new subscription', subscription)
      await User.findOneAndUpdate({ _id: monk.id(doc._id) }, { $set: { subscription, subscriptionUpdatedAt: new Date(), previousSubscription: doc.subscription } })
      console.log('updated subscription')
      resume()
    }
  })
}
