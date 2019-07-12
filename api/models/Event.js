const db = require('../db')
const events = db.get('events')

module.exports = events

events.createIndex({ createdAt: 1 })
events.createIndex({ createdAt: 1, name: 1 })
events.createIndex({ name: 1 })
events.createIndex({ userId: 1 })

events.createIndex({ createdAt: -1 })
events.createIndex({ createdAt: -1, name: 1 })
events.createIndex({ name: -1 })
