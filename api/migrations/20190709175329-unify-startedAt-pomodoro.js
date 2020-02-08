module.exports = {
  async up (db) {
    const pomodorosColl = db.collection('pomodoros')
    const docs = await pomodorosColl.find({ startedAt: { $type: 'string' } }).toArray()

    for (const doc of docs) {
      console.log('updating doc', doc._id, doc.startedAt, new Date(doc.startedAt))
      try {
        await pomodorosColl.updateOne({ _id: doc._id }, { $set: { startedAt: new Date(doc.startedAt) } })
      } catch (err) {
        console.error(err.message, err)
      }
    }
  },

  async down (db) {
  }
}
