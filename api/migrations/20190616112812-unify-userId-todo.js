module.exports = {
  async up (db) {
    const todosColl = db.collection('todos')
    todosColl.find({ user: { $exists: true } }).forEach(function (doc) {
      console.log('updating doc', doc._id, doc.createdAt, new Date(doc.createdAt))
      todosColl.updateOne({ _id: doc._id }, { $set: { userId: doc.user && doc.user._id }, $unset: { 'user': '' } })
    })
  },

  async down (db) {
  }
}
