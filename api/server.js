require('dotenv').config()
const healthcheck = require('./routes/healthcheck-factory')
const pomodoros = require('./routes/pomodoros-factory')
const subscriptions = require('./routes/subscriptions-factory')
const team = require('./routes/team-factory')
const todos = require('./routes/todos-factory')
const user = require('./routes/user-factory')

const app = require('./app')
app.use(healthcheck)
app.use(pomodoros)
app.use(subscriptions)
app.use(team)
app.use(todos)
app.use(user)

const PORT = process.env.PORT || 3000
console.log('port', PORT)
app.listen(3000)

module.exports = app
