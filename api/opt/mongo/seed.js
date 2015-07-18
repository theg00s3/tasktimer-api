var userId = 2662706

use pomodoro;

db.pomodori.remove({
  "startedAt": {
    $gte: new Date("2015-07-12T00:00:00.000+02:00"),
    $lt: new Date("2015-07-13T00:00:00.000+02:00"),
  }
})

db.pomodori.insert({
  "startedAt": new Date("2015-07-12T09:00:00.000+02:00"),
  "minutes": 25,
  "type": "pomodoro",
  "userId": userId
})
db.pomodori.insert({
  "startedAt": new Date("2015-07-12T09:25:00.000+02:00"),
  "minutes": 5,
  "type": "break",
  "userId": userId
})
db.pomodori.insert({
  "startedAt": new Date("2015-07-12T09:30:00.000+02:00"),
  "minutes": 25,
  "type": "pomodoro",
  "userId": userId
})
db.pomodori.insert({
  "startedAt": new Date("2015-07-12T09:55:00.000+02:00"),
  "minutes": 5,
  "type": "break",
  "userId": userId
})
db.pomodori.insert({
  "startedAt": new Date("2015-07-12T10:00:00.000+02:00"),
  "cancelledAt": new Date("2015-07-12T10:13:00.000+02:00"),
  "minutes": 25,
  "type": "pomodoro",
  "userId": userId
})
db.pomodori.insert({
  "startedAt": new Date("2015-07-12T10:15:00.000+02:00"),
  "minutes": 15,
  "type": "break",
  "userId": userId
})
db.pomodori.insert({
  "startedAt": new Date("2015-07-12T10:30:00.000+02:00"),
  "minutes": 25,
  "type": "pomodoro",
  "userId": userId
})