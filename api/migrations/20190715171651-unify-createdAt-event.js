module.exports = {
  async up (db) {
    const eventsColl = db.collection('events')
    await eventsColl.find({ updatedAt: { $exists: true } })
      .forEach(function (doc) {
        console.log('updating doc', doc._id, doc.name, doc.updatedAt, new Date(doc.updatedAt))
        eventsColl.updateOne({ _id: doc._id }, { $set: { createdAt: new Date(doc.updatedAt) }, $unset: { updatedAt: true } })
      })
  },

  async down (db) {
  }
}
