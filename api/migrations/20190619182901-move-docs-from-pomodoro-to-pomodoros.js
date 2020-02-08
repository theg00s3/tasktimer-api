const monk = require('monk')
module.exports = {
  async up (db) {
    const pomodoroColl = db.collection('pomodoro')
    const pomodorosColl = db.collection('pomodoros')
    const pomodoros = await pomodoroColl.find({}).toArray()

    for (const pomodoro of pomodoros) {
      console.log('updating pomodoro', pomodoro._id, pomodoro.createdAt, new Date(pomodoro.createdAt))
      let { userId } = pomodoro
      userId = monk.id(userId)
      Object.assign(pomodoro, { userId })
      try {
        await pomodorosColl.insertOne(pomodoro)
      } catch (err) {
        console.error(err.message, err)
      }
    }
  },

  async down (db) {
  }
}
