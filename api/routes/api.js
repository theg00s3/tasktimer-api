const api = require('../app')
const User = require('../models/User')
const Event = require('../models/Event')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const plan = process.env.STRIPE_PLAN || 'pro'

module.exports = api

api.get('/api', (req, res) => {
  console.log('BASE_URL', process.env.BASE_URL)
  res.writeHead(200)
  res.end()
})
api.post('/api/create-subscription', async function (req, res) {
  console.log('req.params', req.params)
  console.log('req.body', req.body)
  console.log('req.user', req.user)
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

  console.log('userId, email, token', userId, email, token)

  let [customerError, customer] = await createCustomer(email, token)
  if (customerError) {
    console.error(customerError)
    await Event.insert({ name: 'createCustomerFailed', createdAt: new Date(), userId, email, customerError }).catch(Function.prototype)
    return res.json({ error: 'create-customer-failed' })
  }
  console.log('  customer created', customer, userId, email)
  await Event.insert({ name: 'createCustomerSucceeded', createdAt: new Date(), userId, email, customer }).catch(Function.prototype)

  const [subscriptionError, subscription] = await createSubscription(customer.id)
  if (subscriptionError) {
    console.error(subscriptionError)
    await Event.insert({ name: 'createSubscriptionFailed', createdAt: new Date(), userId, email, subscriptionError }).catch(Function.prototype)
    return res.json({ error: 'create-subscription-failed' })
  }
  console.log('  subscription created', subscription, userId, email)
  await Event.insert({ name: 'createSubscriptionSucceeded', createdAt: new Date(), userId, email, customer, subscription }).catch(Function.prototype)

  const user = await User.findOneAndUpdate({ _id: userId }, { $set: { updatedAt: new Date(), customer, customerUpdatedAt: new Date(), subscription, subscriptionUpdatedAt: new Date() } }, { new: true })

  req.session = user

  return res.json({ message: 'create-subscription-succeeded', user })
})

api.post('/api/pomodoro', (req, res) => {
  console.log('req.user', req.user)
  console.log('req.body', req.body)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }
  console.log('creating pomodoro', req.user, req.body)
  res.writeHead(200)
  res.end()
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

async function createSubscription (customerId) {
  process.nextTick(() => {
    Event.insert({ name: 'createSubscription', createdAt: new Date(), customerId }).catch(Function.prototype)
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

if (process.env.NODE_ENV !== 'production') {
  api.get('/user/fake', (req, res) => {
    console.log('req.user', req.user)
    const user = {
      '_id': '5a9fe4e085d766000c002636',
      'apikey': 'xxx',
      'id': '2662706',
      'avatar': 'https://avatars0.githubusercontent.com/u/2662706?v=4',
      'username': 'christian-fei'
    }
    req.user = user
    res.json(user)
  })
}
