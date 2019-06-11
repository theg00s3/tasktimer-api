const api = require('../app')
const User = require('../models/User')
const Event = require('../models/Event')
const Pomodoro = require('../models/Pomodoro')
const Todo = require('../models/Todo')
const PomodoroQueryBuilder = require('../modules/PomodoroQueryBuilder')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const plan = process.env.STRIPE_PLAN || 'pro'
const pomodoroValidationErrors = require('../modules/pomodoro-validation-errors')
const todoValidationErrors = require('../modules/todo-validation-errors')
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

api.post('/pomodoros', async (req, res) => {
  logger.info('create pomodoro for user', req.user && req.user.username, req.body)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }

  const userId = req.user._id
  const pomodoro = req.body

  await Event.insert({ name: 'createPomodoro', createdAt: new Date(), userId: userId, pomodoro }).catch(Function.prototype)

  const errors = pomodoroValidationErrors(pomodoro)
  logger.info('pomodoro, errors', pomodoro, errors)

  if (errors) {
    logger.info('pomodoro validation errors', errors)
    await Event.insert({ name: 'pomodoroFailedValidation', createdAt: new Date(), userId: userId, pomodoro }).catch(Function.prototype)
    res.writeHead(422)
    return res.end()
  }

  const duplicateCount = await Pomodoro.count({ userId, startedAt: pomodoro.startedAt })
  if (duplicateCount > 0) {
    logger.info('found duplicate pomodoro', duplicateCount)
    await Event.insert({ name: 'pomodoroDuplicate', createdAt: new Date(), userId: userId, pomodoro }).catch(Function.prototype)
    res.writeHead(409)
    return res.end()
  }

  Object.assign(pomodoro, { userId })

  logger.info('inserting pomodoro', pomodoro)
  await Pomodoro.insert(pomodoro)
  await Event.insert({ name: 'pomodoroCreated', createdAt: new Date(), userId: userId, pomodoro }).catch(Function.prototype)

  res.json(pomodoro)
})

api.post('/todos', async (req, res) => {
  logger.info('create todo for user', req.user && req.user.username, req.body)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }

  const todo = req.body

  await Event.insert({ name: 'createTodo', createdAt: new Date(), userId: req.user._id, todo }).catch(Function.prototype)

  const errors = todoValidationErrors(todo)
  logger.info('todo, errors', todo, errors)
  if (errors === null) {
    Object.assign(todo, { userId: req.user._id })
    await Todo.insert(todo)
    await Event.insert({ name: 'todoCreated', createdAt: new Date(), userId: req.user._id, todo }).catch(Function.prototype)
  } else {
    await Event.insert({ name: 'todoFailedValidation', createdAt: new Date(), userId: req.user._id, todo }).catch(Function.prototype)
    res.writeHead(422)
    return res.end()
  }

  res.json(todo)
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

if (process.env.NODE_ENV !== 'production') {
  api.get('/user/fake', (req, res) => {
    logger.info('req.user', req.user)
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
