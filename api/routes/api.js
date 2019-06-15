const api = require('../app')
const User = require('../models/User')
const Event = require('../models/Event')
const Pomodoro = require('../models/Pomodoro')
const DuplicateError = require('../errors/duplicate')
const ValidationError = require('../errors/validation')
const PomodoroQueryBuilder = require('../modules/PomodoroQueryBuilder')
const { createUserPomodoro } = require('../modules/create-user-pomodoro')
const { createUserTodo } = require('../modules/create-user-todo')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const plan = process.env.STRIPE_PLAN || 'pro'
const logger = require('pino')()

module.exports = api

api.post('/subscriptions', async function (req, res) {
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

  logger.info('createSubscription userId, email, token', userId, email, token)

  let [customerError, customer] = await createCustomer(email, token)
  if (customerError) {
    logger.error(customerError)
    await Event.insert({ name: 'createCustomerFailed', createdAt: new Date(), userId, email, customerError }).catch(Function.prototype)
    return res.json({ error: 'create-customer-failed' })
  }
  logger.info('  customer created', customer, userId, email)
  await Event.insert({ name: 'createCustomerSucceeded', createdAt: new Date(), userId, email, customer }).catch(Function.prototype)

  const [subscriptionError, subscription] = await createSubscription(userId, customer.id)
  if (subscriptionError) {
    logger.error(subscriptionError)
    await Event.insert({ name: 'createSubscriptionFailed', createdAt: new Date(), userId, email, subscriptionError }).catch(Function.prototype)
    return res.json({ error: 'create-subscription-failed' })
  }
  logger.info('  subscription created', subscription, userId, email)
  await Event.insert({ name: 'createSubscriptionSucceeded', createdAt: new Date(), userId, email, customer, subscription }).catch(Function.prototype)

  const user = await User.findOneAndUpdate({ _id: userId }, { $set: { updatedAt: new Date(), customer, customerUpdatedAt: new Date(), subscription, subscriptionUpdatedAt: new Date() } }, { new: true })

  return res.json({ message: 'create-subscription-succeeded', user })
})

api.get('/pomodoros', async (req, res) => {
  const pomodoroQuery = PomodoroQueryBuilder().withRequest(req).build()
  logger.info('pomodoroQuery', pomodoroQuery)
  const pomodoros = await Pomodoro.find(pomodoroQuery)
  logger.info('pomodoros', pomodoros)
  res.json(pomodoros)
})

api.get('/pomodoros/weekly/:week', async (req, res) => {
  const pomodoroQuery = PomodoroQueryBuilder().withRequest(req).build()
  logger.info('pomodoroQuery', pomodoroQuery)
  const pomodoros = await Pomodoro.find(pomodoroQuery)
  logger.info('pomodoros', pomodoros)
  res.json(pomodoros)
})

api.post('/pomodoros', async (req, res) => {
  logger.info('create pomodoro for user', req.user && req.user.username, req.body)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }

  const user = req.user
  const pomodoro = req.body
  await createUserPomodoro({ user, pomodoro })
    .then((pomodoro) => {
      logger.info(pomodoro)
      res.json(pomodoro)
    })
    .catch(err => {
      logger.error(err)
      if (err instanceof DuplicateError) {
        res.writeHead(409)
        return res.end()
      }
      res.writeHead(422)
      return res.end()
    })
})

api.post('/todos', async (req, res) => {
  logger.info('create todo for user', req.user && req.user.username, req.body)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }

  const user = req.user
  const todo = req.body

  await createUserTodo({ user, todo })
    .then((todo) => {
      logger.info(todo)
      res.json(todo)
    })
    .catch(err => {
      logger.error(err)
      if (err instanceof ValidationError) {
        res.writeHead(422)
        return res.end()
      }

      res.writeHead(422)
      return res.end()
    })
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
