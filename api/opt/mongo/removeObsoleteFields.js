use pomodoro;
db.pomodori.count()
db.pomodori.update({},{$unset: {'day': ''}}, {multi:true})
db.pomodori.update({},{$unset: {'week': ''}}, {multi:true})
