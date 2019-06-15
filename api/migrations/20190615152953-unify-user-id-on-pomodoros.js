const monk = require('monk')

module.exports = {
  async up (db) {
    const usersColl = db.collection('users')
    usersColl.find({}).forEach(function (doc) {
      usersColl.updateOne({ _id: doc._id }, { $set: { 'userId': monk.id(doc.userId) } })
    })
  },

  async down (db) {
  }
}
