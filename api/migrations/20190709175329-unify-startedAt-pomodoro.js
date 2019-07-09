module.exports = {
  async up (db) {
    const pomodorosColl = db.collection('pomodoros')
    const docs = await pomodorosColl.find({ startedAt: { $type: 'string' } }).toArray()
    console.log(docs)
    for (let doc of docs) {
      console.log('updating doc', doc._id, doc.startedAt, new Date(doc.startedAt))
      await pomodorosColl.updateOne({ _id: doc._id }, { $set: { 'startedAt': new Date(doc.startedAt) } })
    }
  },

  async down (db) {
  }
}
