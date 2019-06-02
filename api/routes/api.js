const app = require('../app')
const passport = require('passport')
const session = require('express-session')
const TwitterStrategy = require('passport-twitter').Strategy
const GithubStrategy = require('passport-github').Strategy
const MongoStore = require('connect-mongo')(session)
const UserInfo = require('../modules/UserInfo')
const User = require('../models/User')
const Event = require('../models/Event')
const TeamPomodoro = require('../models/TeamPomodoro')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const plan = process.env.STRIPE_PLAN || 'monthly'

const Pusher = require('pusher')
var pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'eu',
  useTLS: true
})

const redirectRoutes = { failureRedirect: 'https://pomodoro.cc', successRedirect: 'https://pomodoro.cc' }

module.exports = app

if (process.env.USE_AUTH === true || process.env.NODE_ENV === 'production') {
  console.log('using auth')
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'foo',
    cookie: {
      domain: '.pomodoro.cc',
      sameSite: false
    },
    store: new MongoStore({
      collection: 'sessions',
      url: process.env.MONGO_URL
    })
  }))

  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL
  }, upsertAuthenticatedUser))
  passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, upsertAuthenticatedUser))

  passport.serializeUser(function (user, done) {
    done(null, user)
  })

  passport.deserializeUser(function (user, done) {
    done(null, user)
  })

  app.get('/twitter', passport.authenticate('twitter'))
  app.get('/twitter/callback', passport.authenticate('twitter', redirectRoutes))
  app.get('/github', passport.authenticate('github'))
  app.get('/github/callback', passport.authenticate('github', redirectRoutes))
} else {
  console.log('not using auth')
}

app.get('/info', (req, res) => {
  console.log('req.user', req.user)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }
  res.json(req.user)
})
app.get('/logout', (req, res) => {
  console.log('req.user', req.user)
  req.logout()
  res.end()
})

app.get('/api', (req, res) => {
  res.end('ok')
})

function getRemaining (pomodoro) {
  let remaining = 0
  if (pomodoro && !pomodoro.cancelled && pomodoro.minutes && pomodoro.startedAt) {
    let elapsed = (Date.now() - +new Date(pomodoro.startedAt))
    elapsed = elapsed / 1000 << 0
    remaining = pomodoro.minutes * 60 - elapsed
  }
  remaining = remaining << 0
  return remaining
}

// team
app.post('/team/:channel', async (req, res) => {
  const body = JSON.parse(JSON.stringify(req.body))
  console.log('body', body)
  if (!body.minutes || !body.type) {
    res.writeHead(422)
    return res.end()
  }
  const channel = req.params.channel
  let pomodoro = await TeamPomodoro.findOne({ channel }) || {}

  const remaining = getRemaining(pomodoro)

  if (remaining === 0 || (pomodoro.minutes !== body.minutes)) {
    pomodoro.startedAt = new Date()
    pomodoro.cancelled = false
  } else {
    pomodoro.cancelled = (pomodoro.minutes === body.minutes)
  }
  pomodoro = Object.assign({}, pomodoro, body)

  pomodoro = await TeamPomodoro.findOneAndUpdate({ channel }, { $set: pomodoro }, { new: true, upsert: true })

  if (process.env.NODE_ENV !== 'test') {
    pusher.trigger(channel, 'event', {
      channel,
      pomodoro
    }, (err, response) => {
      if (err) throw err
      res.json(pomodoro)
    })
  } else {
    res.json(pomodoro)
  }
})

app.get('/team/:channel/status', async (req, res) => {
  const channel = req.params.channel
  const pomodoro = await TeamPomodoro.findOne({ channel }) || {}

  res.json(pomodoro)
})

// stripe
app.post('/create-subscription', async function (req, res) {
  console.log('req.params', req.params)
  console.log('req.body', req.body)
  console.log('req.user', req.user)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }
  const { email, stripeToken } = req.body
  const { _id: userId } = req.user

  if (!stripeToken) {
    return res.json({ error: 'missing stripeToken' })
  }
  if (!email) {
    return res.json({ error: 'missing email' })
  }

  console.log('userId, email, stripeToken', userId, email, stripeToken)

  let [customerError, customer] = await createCustomer(email, stripeToken)
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

  const user = await User.findOneAndUpdate({ _id: userId }, { $set: { customer, subscription } }, { new: true })

  return res.json({ message: 'create-subscription-succeeded', user })
})

function createCustomer (email, source) {
  process.nextTick(() => {
    Event.insert({ name: 'createCustomer', createdAt: new Date(), email, source }).catch(Function.prototype)
  })

  try {
    return [null, stripe.customers.create({ email, source })]
  } catch (err) {
    return [err]
  }
}

function createSubscription (customerId) {
  process.nextTick(() => {
    Event.insert({ name: 'createSubscription', createdAt: new Date(), customerId }).catch(Function.prototype)
  })
  try {
    return [null, stripe.subscriptions.create({
      customer: customerId,
      items: [{
        plan
      }]
    })]
  } catch (err) {
    return [err]
  }
}

if (process.env.NODE_ENV !== 'production') {
  app.get('/fake', (req, res) => {
    console.log('req.user', req.user)
    req.user = {
      '_id': '5a9fe4e085d766000c002636',
      'apikey': 'xxx',
      'id': '2662706',
      'avatar': 'https://avatars0.githubusercontent.com/u/2662706?v=4',
      'username': 'christian-fei'
    }
    res.json(req.user)
  })
}

function upsertAuthenticatedUser (token, tokenSecret, profile, done) {
  var user = new UserInfo(profile).toJSON()

  User.findOne({ id: user.id })
    .then(user => {
      if (user) return done(null, user)
      User.insert(new UserInfo(profile))
        .then(user => {
          done(null, user)
        })
        .catch(err => {
          if (err) return done(err, null)
        })
    })
}
