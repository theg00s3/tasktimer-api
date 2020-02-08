module.exports = {
  async up (db) {
    const todosColl = db.collection('todos')
    const todos = await todosColl.find({ createdAt: { $type: 'string' } }).toArray()

    for (const doc of todos) {
      console.log('updating doc', doc._id, doc.createdAt, new Date(doc.createdAt))
      await todosColl.updateOne({ _id: doc._id }, { $set: { createdAt: new Date(doc.createdAt) } })
    }
  },

  async down (db) {
  }
}
