module.exports = {
  async up (db) {
    const pomodorosColl = db.collection('pomodoros')
    pomodorosColl.find({ cancelledAt: { $type: 'string' } }).forEach(function (doc) {
      console.log('updating doc', doc._id, doc.cancelledAt, new Date(doc.cancelledAt))
      pomodorosColl.updateOne({ _id: doc._id }, { $set: { 'cancelledAt': new Date(doc.cancelledAt) } })
    })
  },

  async down (db) {
  }
}
