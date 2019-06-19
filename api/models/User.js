const db = require('../db')
const users = db.get('users')

module.exports = users

users.createIndex({ _id: 1 })
users.createIndex({ createdAt: 1 })
