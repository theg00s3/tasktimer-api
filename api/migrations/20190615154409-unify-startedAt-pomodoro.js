module.exports = {
  async up (db) {
    const pomodorosColl = db.collection('pomodoros')
    pomodorosColl.find({ startedAt: { $type: 'string' } }).forEach(function (doc) {
      console.log('updating doc', doc._id, doc.startedAt, new Date(doc.startedAt))
      pomodorosColl.updateOne({ _id: doc._id }, { $set: { 'startedAt': new Date(doc.startedAt) } })
    })
  },

  async down (db) {
  }
}
