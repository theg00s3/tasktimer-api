const app = require('express')()
const Sentry = require('@sentry/node')
Sentry.init({ dsn: process.env.SENTRY_DSN })

const middlewares = require('./middlewares')

app.set('trust proxy', 1)
app.use(...middlewares)

module.exports = app
