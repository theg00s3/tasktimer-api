module.exports = {
  async up (db) {
    const eventsColl = db.collection('events')
    eventsColl.find({ updatedAt: { $exists: true } }).forEach(async function (doc) {
      console.log('updating doc', doc._id, doc.name, doc.updatedAt, new Date(doc.updatedAt))
      await eventsColl.updateOne({ _id: doc._id }, { $set: { createdAt: new Date(doc.updatedAt) }, $unset: { updatedAt: true } })
    })
  },

  async down (db) {
  }
}
