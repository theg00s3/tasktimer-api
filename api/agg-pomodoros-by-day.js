db.pomodoros.aggregate([{
  $match: {
    userId: ObjectId('5cc061299fe121000160c0c7'),
    type: 'pomodoro'
  }
}, {
  $project: {
    yearMonthDay: { $substr: ["$startedAt", 0, 10] }
  }
}, {
  $group: {
    _id: '$yearMonthDay',
    count: { $sum: 1 }
  }
}])
