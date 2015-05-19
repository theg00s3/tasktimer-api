var router = require('express').Router()
  , url = require('url')
  , db = require('../modules/db.connection.js')
  , BSON = require('mongodb').BSONPure
  , PomodoroValidator = require('../modules/PomodoroValidator')
  , Statistics = require('../modules/Statistics')
  , utils = require('../modules/utils')


var pomodori
  , users

db(function(conn){
  pomodori = conn.collection('pomodori')
  users = conn.collection('users')
})

Statistics.use(db, function(){
  console.log( '-- Statistics: using mongodb connection' )
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
  if( errors.length > 0 ) return res.status(422).json(errors)

  var pomodoro = utils.cleanPomodoro(rawPomodoro)
  pomodoro.username = req.user.username

  var queryOptions = {upsert:true}

  pomodori.update({username:pomodoro.username,startedAt:pomodoro.startedAt}, pomodoro, queryOptions, function(err, _, result){
    if(err) return res.sendStatus(500)
    if( result.upserted && result.upserted[0] )
      res.status(201).location('/api/pomodoro/'+result.upserted[0]._id).end()
    else
      res.sendStatus(201)
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
  var pomodoroId = new BSON.ObjectID(req.params.id)

  pomodori.findOne({username:username,_id:pomodoroId}, function(err,pomodoro){
    if( err ) return res.sendStatus(500)
    if( !pomodoro ) return res.sendStatus(404)
    res.json(pomodoro)
  })
})




router.get('/statistics', function(req,res){
  Statistics.getAll(function(statistics){
    res.json(statistics)
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
