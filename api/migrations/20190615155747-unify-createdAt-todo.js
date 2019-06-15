module.exports = {
  async up (db) {
    const todosColl = db.collection('todos')
    todosColl.find({ createdAt: { $type: 'string' } }).forEach(function (doc) {
      console.log('updating doc', doc._id, doc.createdAt, new Date(doc.createdAt))
      todosColl.updateOne({ _id: doc._id }, { $set: { 'createdAt': new Date(doc.createdAt) } })
    })
  },

  async down (db) {
  }
}
