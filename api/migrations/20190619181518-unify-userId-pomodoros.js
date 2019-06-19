const monk = require('monk')
module.exports = {
  async up (db) {
    const pomodorosColl = db.collection('pomodoros')
    const pomodoros = await pomodorosColl.find({ userId: { $type: 'string' } }).toArray()
    for (const pomodoro of pomodoros) {
      console.log('updating pomodoro', pomodoro._id, pomodoro.createdAt, new Date(pomodoro.createdAt))
      await pomodorosColl.updateOne({ _id: pomodoro._id }, { $set: { userId: monk.id(pomodoro.userId) } })
    }
  },

  async down (db) {
  }
}
