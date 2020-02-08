module.exports = {
  async up (db) {
    const pomodorosColl = db.collection('pomodoros')
    const pomodoros = await pomodorosColl.find({ cancelledAt: { $type: 'string' } }).toArray()

    for (const doc of pomodoros) {
      console.log('updating doc', doc._id, doc.cancelledAt, new Date(doc.cancelledAt))
      await pomodorosColl.updateOne({ _id: doc._id }, { $set: { cancelledAt: new Date(doc.cancelledAt) } })
    }
  },

  async down (db) {
  }
}
