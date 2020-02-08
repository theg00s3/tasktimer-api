const monk = require('monk')

module.exports = {
  async up (db) {
    const usersColl = db.collection('users')
    const users = await usersColl.find({}).toArray()

    for (const doc of users) {
      console.log('updating doc', doc._id)
      await usersColl.updateOne({ _id: doc._id }, { $set: { userId: monk.id(doc.userId) } })
    }
  },

  async down (db) {
  }
}
