const monk = require('monk')

module.exports = {
  async up (db) {
    const usersColl = db.collection('users')
    usersColl.find({}).forEach(function (doc) {
      console.log('updating doc', doc._id)
      usersColl.updateOne({ _id: doc._id }, { $set: { 'userId': monk.id(doc.userId) } })
    })
  },

  async down (db) {
  }
}
