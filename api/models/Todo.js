const db = require('../db')
const todos = db.get('todos')

module.exports = todos

todos.createIndex({ createdAt: 1 })
todos.createIndex({ createdAt: -1 })
todos.createIndex({ createdAt: -1, userId: 1 })
todos.createIndex({ deleted: 1 })
todos.createIndex({ deletedAt: 1 })
todos.createIndex({ deletedAt: -1 })
todos.createIndex({ deletedAt: -1, userId: 1 })
todos.createIndex({ completed: 1 })
todos.createIndex({ completedAt: 1 })
todos.createIndex({ completedAt: -1 })
todos.createIndex({ completedAt: -1, userId: 1 })
todos.createIndex({ userId: 1 })
todos.createIndex({ type: 1 })
todos.createIndex({ minutes: 1 })
todos.createIndex({ cancelledAt: 1 })
todos.createIndex({ id: 1 })
