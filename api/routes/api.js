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

  await Event.insert({ name: 'createPomodoro', createdAt: new Date(), user: req.user, pomodoro }).catch(Function.prototype)

  const errors = pomodoroValidationErrors(pomodoro)
  logger.info('pomodoro, errors', pomodoro, errors)

  if (errors) {
    logger.info('pomodoro validation errors', errors)
    await Event.insert({ name: 'pomodoroFailedValidation', createdAt: new Date(), user: req.user, pomodoro, errors }).catch(Function.prototype)
    res.writeHead(422)
    return res.end()
  }

  const duplicateCount = await Pomodoro.count({ userId, startedAt: pomodoro.startedAt })
  if (duplicateCount > 0) {
    logger.info('found duplicate pomodoro', duplicateCount)
    await Event.insert({ name: 'pomodoroDuplicate', createdAt: new Date(), user: req.user, pomodoro }).catch(Function.prototype)
    res.writeHead(409)
    return res.end()
  }

  Object.assign(pomodoro, { userId })

  logger.info('inserting pomodoro', pomodoro)
  await Pomodoro.insert(pomodoro)
  await Event.insert({ name: 'pomodoroCreated', createdAt: new Date(), user: req.user, pomodoro }).catch(Function.prototype)

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
    const user = { '_id': '5cfffebcbac8a8391a8a5adc', 'apikey': '605dda6d9b35d5e7e2d1b0b8ecc44986ecfba25b', 'id': '128166532', 'avatar': 'https://pbs.twimg.com/profile_images/1137706263155007490/eMMEytoA_normal.jpg', 'username': 'christian_fei', 'customer': { 'id': 'cus_FEjA8BGZkZzex1', 'object': 'customer', 'account_balance': 0, 'address': null, 'balance': 0, 'created': 1560281548, 'currency': null, 'default_source': 'card_1EkFhfHLHpGSODikBzsLMCaG', 'delinquent': false, 'description': null, 'discount': null, 'email': 'crifei93@gmail.com', 'invoice_prefix': '62E97F38', 'invoice_settings': { 'custom_fields': null, 'default_payment_method': null, 'footer': null }, 'livemode': false, 'metadata': { }, 'name': null, 'phone': null, 'preferred_locales': [ ], 'shipping': null, 'sources': { 'object': 'list', 'data': [ { 'id': 'card_1EkFhfHLHpGSODikBzsLMCaG', 'object': 'card', 'address_city': null, 'address_country': null, 'address_line1': null, 'address_line1_check': null, 'address_line2': null, 'address_state': null, 'address_zip': null, 'address_zip_check': null, 'brand': 'Visa', 'country': 'US', 'customer': 'cus_FEjA8BGZkZzex1', 'cvc_check': 'pass', 'dynamic_last4': null, 'exp_month': 4, 'exp_year': 2022, 'fingerprint': 'tOAxLl4vXbt4oE39', 'funding': 'credit', 'last4': '4242', 'metadata': { }, 'name': 'crifei93@gmail.com', 'tokenization_method': null } ], 'has_more': false, 'total_count': 1, 'url': '/v1/customers/cus_FEjA8BGZkZzex1/sources' }, 'subscriptions': { 'object': 'list', 'data': [ ], 'has_more': false, 'total_count': 0, 'url': '/v1/customers/cus_FEjA8BGZkZzex1/subscriptions' }, 'tax_exempt': 'none', 'tax_ids': { 'object': 'list', 'data': [ ], 'has_more': false, 'total_count': 0, 'url': '/v1/customers/cus_FEjA8BGZkZzex1/tax_ids' }, 'tax_info': null, 'tax_info_verification': null }, 'subscription': { 'id': 'sub_FEjAEmob4Xj50K', 'object': 'subscription', 'application_fee_percent': null, 'billing': 'charge_automatically', 'billing_cycle_anchor': 1560281549, 'billing_thresholds': null, 'cancel_at': null, 'cancel_at_period_end': false, 'canceled_at': null, 'collection_method': 'charge_automatically', 'created': 1560281549, 'current_period_end': 1562873549, 'current_period_start': 1560281549, 'customer': 'cus_FEjA8BGZkZzex1', 'days_until_due': null, 'default_payment_method': null, 'default_source': null, 'default_tax_rates': [ ], 'discount': null, 'ended_at': null, 'items': { 'object': 'list', 'data': [ { 'id': 'si_FEjAke0CVuG2M9', 'object': 'subscription_item', 'billing_thresholds': null, 'created': 1560281549, 'metadata': { }, 'plan': { 'id': 'pro', 'object': 'plan', 'active': true, 'aggregate_usage': null, 'amount': 100, 'billing_scheme': 'per_unit', 'created': 1559486458, 'currency': 'eur', 'interval': 'month', 'interval_count': 1, 'livemode': false, 'metadata': { }, 'nickname': 'Pro', 'product': 'prod_FBHQ8HGEui2XMQ', 'tiers': null, 'tiers_mode': null, 'transform_usage': null, 'trial_period_days': 14, 'usage_type': 'licensed' }, 'quantity': 1, 'subscription': 'sub_FEjAEmob4Xj50K', 'tax_rates': [ ] } ], 'has_more': false, 'total_count': 1, 'url': '/v1/subscription_items?subscription=sub_FEjAEmob4Xj50K' }, 'latest_invoice': 'in_1EkFhpHLHpGSODikOEYgvGgg', 'livemode': false, 'metadata': { }, 'plan': { 'id': 'pro', 'object': 'plan', 'active': true, 'aggregate_usage': null, 'amount': 100, 'billing_scheme': 'per_unit', 'created': 1559486458, 'currency': 'eur', 'interval': 'month', 'interval_count': 1, 'livemode': false, 'metadata': { }, 'nickname': 'Pro', 'product': 'prod_FBHQ8HGEui2XMQ', 'tiers': null, 'tiers_mode': null, 'transform_usage': null, 'trial_period_days': 14, 'usage_type': 'licensed' }, 'quantity': 1, 'schedule': null, 'start': 1560281549, 'start_date': 1560281549, 'status': 'active', 'tax_percent': null, 'trial_end': null, 'trial_start': null }, 'updatedAt': new Date('2019-06-11T19:32:31.441Z'), 'customerUpdatedAt': new Date('2019-06-11T19:32:31.441Z'), 'subscriptionUpdatedAt': new Date('2019-06-11T19:32:31.441Z') }
    req.user = user
    res.json(user)
  })
}
