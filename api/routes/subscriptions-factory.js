const { Router } = require('express')
const router = Router()
const hasActiveSubscription = user => user && user.subscription && user.subscription.status === 'active'

module.exports = router

const logger = require('pino')()
const User = require('../models/User')
const Event = require('../models/Event')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const plan = process.env.STRIPE_PLAN || 'pro'

router.post('/subscriptions', async function (req, res) {
  // logger.info('req.params', req.params)
  // logger.info('req.body', req.body)
  // logger.info('req.user', req.user)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }
  const { email, token } = req.body
  const { _id: userId } = req.user

  if (!token) {
    return res.json({ error: 'missing token' })
  }
  if (!email) {
    return res.json({ error: 'missing email' })
  }

  let customer

  const existingCustomer = await User.findOne({ 'customer.email': email })

  if (existingCustomer) {
    console.log('existingCustomer', JSON.stringify(existingCustomer))
    const [customerError, _customer] = await getExistingCustomer(existingCustomer.customer.id)
    if (customerError) return res.json({ error: 'error-retrieving-existing-customer' })
    customer = _customer
  } else {
    logger.info('createSubscription userId, email, token', userId, email, token)

    const [customerError, _customer] = await createCustomer(email, token)
    if (customerError) {
      logger.error(customerError)
      await Event.insert({ name: 'createCustomerFailed', createdAt: new Date(), userId, email, customerError }).catch(Function.prototype)
      return res.json({ error: 'create-customer-failed' })
    }
    customer = _customer
    logger.info('  customer created', customer, userId, email)
    await Event.insert({ name: 'createCustomerSucceeded', createdAt: new Date(), userId, email, customer }).catch(Function.prototype)
  }

  logger.info('have customer', JSON.stringify(customer))

  const [subscriptionError, subscription] = await createSubscription(userId, customer.id)
  if (subscriptionError) {
    logger.error(subscriptionError)
    await Event.insert({ name: 'createSubscriptionFailed', createdAt: new Date(), userId, email, subscriptionError }).catch(Function.prototype)
    return res.json({ error: 'create-subscription-failed' })
  }
  logger.info('  subscription created', subscription, userId, email)
  await Event.insert({ name: 'createSubscriptionSucceeded', createdAt: new Date(), userId, email, customer, subscription }).catch(Function.prototype)

  const user = await User.findOneAndUpdate({ _id: userId }, { $set: { updatedAt: new Date(), customer, customerUpdatedAt: new Date(), subscription, subscriptionUpdatedAt: new Date() } }, { new: true })

  Object.assign(user, { hasActiveSubscription: hasActiveSubscription(user) })
  Object.assign(req.session.passport.user, user)

  req.session.save()

  return res.json({ message: 'create-subscription-succeeded', user })
})

router.delete('/subscriptions', async function (req, res) {
  // logger.info('req.params', req.params)
  // logger.info('req.body', req.body)
  // logger.info('req.user', req.user)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }
  const { _id: userId } = req.user

  let user = await User.findOne({ _id: userId })

  if (!user.subscription && !user.subscription.id) {
    return res.json({ error: 'no-subscription' })
  }

  logger.info('cancelSubscription userId', userId)

  const [subscriptionError, subscription] = await cancelSubscription(userId, user.subscription.id)
  if (subscriptionError) {
    logger.error(subscriptionError)
    await Event.insert({ name: 'cancelSubscriptionFailed', createdAt: new Date(), userId, subscriptionError }).catch(Function.prototype)
    return res.json({ error: 'cancel-subscription-failed' })
  }
  logger.info('  subscription canceld', subscription, userId)
  await Event.insert({ name: 'cancelSubscriptionSucceeded', createdAt: new Date(), userId, subscription }).catch(Function.prototype)

  user = await User.findOneAndUpdate({ _id: userId }, { $set: { updatedAt: new Date(), subscription, subscriptionUpdatedAt: new Date() } }, { new: true })

  Object.assign(user, { hasActiveSubscription: hasActiveSubscription(user) })
  Object.assign(req.session.passport.user, user)

  req.session.save()

  return res.json({ message: 'cancel-subscription-succeeded', user })
})

async function createCustomer (email, source) {
  process.nextTick(() => {
    Event.insert({ name: 'createCustomer', createdAt: new Date(), email, source }).catch(Function.prototype)
  })

  try {
    const res = await stripe.customers.create({ email, source })
    return [null, res]
  } catch (err) {
    return [err]
  }
}

async function getExistingCustomer (customerId, source) {
  process.nextTick(() => {
    Event.insert({ name: 'getExistingCustomer', createdAt: new Date(), customerId, source }).catch(Function.prototype)
  })

  try {
    const res = await stripe.customers.retrieve(customerId)
    return [null, res]
  } catch (err) {
    return [err]
  }
}

async function createSubscription (userId, customerId) {
  process.nextTick(() => {
    Event.insert({ name: 'createSubscription', createdAt: new Date(), userId, customerId }).catch(Function.prototype)
  })
  try {
    const res = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        plan
      }]
    })
    return [null, res]
  } catch (err) {
    return [err]
  }
}

async function cancelSubscription (userId, subscriptionId) {
  process.nextTick(() => {
    Event.insert({ name: 'createSubscription', createdAt: new Date(), userId, subscriptionId }).catch(Function.prototype)
  })
  try {
    const res = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })

    return [null, res]
  } catch (err) {
    return [err]
  }
}
