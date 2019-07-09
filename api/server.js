require('dotenv').config()
const pomodoros = require('./routes/pomodoros-factory')
const analysis = require('./routes/analysis-factory')
const subscriptions = require('./routes/subscriptions-factory')
const team = require('./routes/team-factory')
const todos = require('./routes/todos-factory')
const user = require('./routes/user-factory')
const cors = require('cors')

const app = require('./app')
app.use(cors())
app.head('/', (req, res) => res.end())
app.use(pomodoros)
app.use(analysis)
app.use(subscriptions)
app.use(team)
app.use(todos)
app.use(user)

const PORT = process.env.PORT || 3000
console.log('port', PORT)
app.listen(3000)

module.exports = app
