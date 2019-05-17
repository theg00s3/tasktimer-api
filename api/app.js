const app = require('express')()
const Sentry = require('@sentry/node')
Sentry.init({ dsn: process.env.SENTRY_DSN })

const middlewares = require('./middlewares')

console.log('MONGO_URL set?', !!process.env.MONGO_URL)

app.set('trust proxy', 1)
app.use(...middlewares)

module.exports = app
