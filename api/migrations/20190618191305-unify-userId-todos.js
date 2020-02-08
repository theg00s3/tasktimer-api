const monk = require('monk')
module.exports = {
  async up (db) {
    const todosColl = db.collection('todos')
    const todos = await todosColl.find({ userId: { $type: 'string' } }).toArray()

    for (const doc of todos) {
      console.log('updating doc', doc._id, doc.createdAt, new Date(doc.createdAt))
      todosColl.updateOne({ _id: doc._id }, { $set: { userId: monk.id(doc.userId) } })
    }
  },

  async down (db) {
  }
}
