// const monk = require('monk')
module.exports = {
  async up (db) {
    const pomodorosColl = db.collection('pomodoros')
    await pomodorosColl.aggregate({
      $match: {
        userId: { $type: 'string' }
      }
    }, {
      $convert: {
        input: '$userId',
        to: 'objectid'
      }
    })
  },

  async down (db) {
  }
}
