const monk = require('monk')
module.exports = {
  async up (db) {
    const eventsColl = db.collection('events')
    const usersColl = db.collection('users')
    const events = await eventsColl.find({ userId: { $exists: true } }).toArray()

    for (const event of events) {
      console.log('updating event', event._id, event.createdAt, new Date(event.createdAt), event.userId)
      const user = await usersColl.findOne({ _id: event.userId })
      if (!user) {
        console.log('  no user found', event.userId)
        continue
      }
      try {
        await eventsColl.updateOne({ _id: event._id }, { $set: { user }, $unset: { userId: 1 } })
        console.log('user for event updated', event._id, user.username)
      } catch (err) {
        console.error(err.message, err)
      }
    }
  },

  async down (db) {
  }
}
