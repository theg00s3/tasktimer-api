const monk = require('monk')
module.exports = {
  async up (db) {
    const todosColl = db.collection('todos')
    const todos = await todosColl.find({ userId: { $type: 'string' } }).toArray()

    for (const todo of todos) {
      console.log('updating todo', todo._id, todo.createdAt, new Date(todo.createdAt))
      await todosColl.updateOne({ _id: todo._id }, { $set: { userId: monk.id(todo.userId) } })
    }
  },

  async down (db) {
  }
}
