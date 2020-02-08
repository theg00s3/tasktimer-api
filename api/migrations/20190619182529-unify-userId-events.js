const monk = require('monk')
module.exports = {
  async up (db) {
    const eventsColl = db.collection('events')
    const events = await eventsColl.find({ userId: { $type: 'string' } }).toArray()

    for (const event of events) {
      console.log('updating event', event._id, event.createdAt, new Date(event.createdAt))
      await eventsColl.updateOne({ _id: event._id }, { $set: { userId: monk.id(event.userId) } })
    }
  },

  async down (db) {
  }
}
