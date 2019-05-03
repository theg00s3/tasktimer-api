if (!process.env.NOW_REGION) { require('dotenv').config() }
const app = require('express')()
const middlewares = require('./middlewares')

if (!process.env.NOW_REGION) {
  const { PORT = 3000 } = process.env
  app.listen(PORT)
  console.log(`listening @ https://api.pomodoro.cc (PORT ${PORT})`)
}

console.log('MONGO_URL set?', !!process.env.MONGO_URL)

app.set('trust proxy', 1)
app.use(...middlewares)

module.exports = app
