const db = require('../db')
const pomodoros = db.get('pomodoros')

module.exports = pomodoros

pomodoros.createIndex({ startedAt: 1 })
pomodoros.createIndex({ startedAt: -1 })
pomodoros.createIndex({ startedAt: -1, userId: 1 })
pomodoros.createIndex({ userId: 1 })
pomodoros.createIndex({ type: 1 })
pomodoros.createIndex({ minutes: 1 })
pomodoros.createIndex({ cancelledAt: 1 })
