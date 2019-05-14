const app = require('express')()
const middlewares = require('./middlewares')

console.log('MONGO_URL set?', !!process.env.MONGO_URL)

app.set('trust proxy', 1)

middlewares.forEach(m => {
  console.log('using ', m.name)
  app.use(m)
})
// app.use(...middlewares)

module.exports = app
