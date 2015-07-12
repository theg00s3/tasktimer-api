var router = require('express').Router()
  , url = require('url')
  , moment = require('moment')
  , db = require('../modules/db.connection.js')
  , BSON = require('mongodb').BSONPure
  , PomodoroValidator = require('../modules/PomodoroValidator')
  , PomodoroMongoQueryBuilder = require('../modules/PomodoroMongoQueryBuilder')
  , utils = require('../modules/utils')
  , constants = require('../constants')
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
    if( err || !user ) {
      return res.sendStatus(401)
    }
    req.user = user
    next()
  })
})

  router.post('/pomodoro', function(req,res){
    var rawPomodoro = req.body

    var errors = PomodoroValidator.validate(rawPomodoro)
    if( Object.keys(errors).length > 0 ) return res.status(422).json(errors)

    var pomodoro = utils.cleanPomodoro(rawPomodoro)
    pomodoro.userId = req.user.id
    pomodoro.startedAt = new Date(pomodoro.startedAt)
    if( pomodoro.cancelledAt ){
      pomodoro.cancelledAt = new Date(pomodoro.cancelledAt)
    }

    pomodori.insert(pomodoro, function(err, doc){
      if(err) return res.sendStatus(500)
      var createdResourceId = doc[0]._id
      res.status(201).location('/api/pomodoro/'+createdResourceId).end()
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
    var pomodoroId
    try {
      pomodoroId = new BSON.ObjectID(req.params.id)
    }catch(e){
      return res.sendStatus(404)
    }

    pomodori.findOne({userId:req.user.id, _id:pomodoroId}, function(err,pomodoro){
      if( err ) return res.sendStatus(500)
      if( !pomodoro ) return res.sendStatus(404)
      res.json(pomodoro)
    })
  })


function requestToMongoQuery(req){
  var builder = new PomodoroMongoQueryBuilder
  builder.withUser(req.user)
  var query = url.parse(req.url, true).query
  builder.withDay(query.day)
  return builder.build()
}


module.exports = router
