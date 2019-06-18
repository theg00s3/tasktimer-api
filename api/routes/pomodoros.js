const pomodoros = require('../app')
const pomodorosFactory = require('./pomodoros-factory')

pomodoros.use(pomodorosFactory)

module.exports = pomodoros
