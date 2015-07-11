use pomodoro;
db.pomodori.count()
db.pomodori.remove({username: {$exists:false}})
db.users.find().forEach(function(user){
  var username = user.username
  var userId = user.id
  print(username)
  print(userId)
  db.pomodori.update({username: username},{$set: {'userId': userId}}, {multi:true})
  db.pomodori.update({username: username},{$unset: {'username': ''}}, {multi:true})
})
