use pomodoro;
db.pomodori.count()
db.pomodori.find({}).forEach(function(doc){
  var startedAt = doc.startedAt
  var cancelledAt = doc.cancelledAt
  var typeOfStartedAt = typeof startedAt
  var typeOfCancelledAt = typeof cancelledAt
  var $set = {}
  if( typeOfStartedAt === 'number' || typeOfStartedAt === 'string' ){
    $set.startedAt = new Date(startedAt)
  }
  if( typeOfCancelledAt === 'number' || typeOfCancelledAt === 'string' ){
    $set.cancelledAt = new Date(cancelledAt)
  }
  print( '-- startedAt', startedAt, typeof startedAt )
  db.pomodori.update(doc, {
    $set: $set
  })
})
