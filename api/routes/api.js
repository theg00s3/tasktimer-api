var router = require('express').Router()
  , url = require('url')
  , db = require('../modules/db.connection.js')
  , BSON = require('mongodb').BSONPure
  , PomodoroValidator = require('../modules/PomodoroValidator')
  , utils = require('../modules/utils')
  , _ = require('underscore')


var pomodori
  , users

db(function(conn){
  pomodori = conn.collection('pomodori')
  users = conn.collection('users')
})



router.use('/pomodoro',function(req,res,next){
  if( req.user ) return next()

  var query = url.parse(req.url, true).query

  if( query.apikey === undefined ) return res.sendStatus(401)

  users.findOne({
    apikey: query.apikey
  }, function(err,user){
    if( err || !user ) return res.sendStatus(401)
    req.user = user
    next()
  })
})

/*
  /pomodoro
*/
router.post('/pomodoro', function(req,res){
  var rawPomodoro = req.body

  var errors = PomodoroValidator.validate(rawPomodoro)
  if( Object.keys(errors).length > 0 ) return res.status(422).json(errors)

  var pomodoro = utils.cleanPomodoro(rawPomodoro)
  pomodoro.username = req.user.username

  var duplicates = _.pick(pomodoro, 'username','startedAt')

  pomodori.find(duplicates).toArray(function(err, doc){
    if(err) return res.sendStatus(500)
    if(doc.length > 0) return res.sendStatus(409)
    pomodori.insert(pomodoro, function(err, doc){
      if(err) return res.sendStatus(500)
      res.status(201).location('/api/pomodoro/'+doc[0]._id).end()
    })
  })

})

router.get('/pomodoro', function(req,res){
  var mongoQuery = requestToMongoQuery(req)

  pomodori.find(mongoQuery).toArray(function(err,pomodoro){
    if( err ) return res.sendStatus(500)
    res.json(pomodoro)
  })
})

router.get('/pomodoro/:id', function(req,res){
  var username = req.user.username
  var pomodoroId
  try {
    pomodoroId = new BSON.ObjectID(req.params.id)
  }catch(e){
    return res.sendStatus(404)
  }

  pomodori.findOne({username:username,_id:pomodoroId}, function(err,pomodoro){
    if( err ) return res.sendStatus(500)
    if( !pomodoro ) return res.sendStatus(404)
    res.json(pomodoro)
  })
})




function requestToMongoQuery(req){
  var mongoQuery = {}

  mongoQuery.username = req.user.username

  var query = url.parse(req.url, true).query

  if( query.day ){
    mongoQuery.day = query.day
  }
  if( query.week ){
    mongoQuery.week = query.week
  }

  return mongoQuery
}


module.exports = router
