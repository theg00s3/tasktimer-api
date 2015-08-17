var router = require('express').Router()
  , url = require('url')
  , moment = require('moment')
  , db = require('../modules/db.connection.js')
  , BSON = require('mongodb').BSONPure
  , PomodoroValidator = require('../modules/PomodoroValidator')
  , PomodoroMongoQueryBuilder = require('../modules/PomodoroMongoQueryBuilder')
  , utils = require('../modules/utils')
  , authorizedMiddleware = require('./middleware/authorized')
  , mongoose = require('mongoose')
  , Pomodoro = require('../models/Pomodoro')

mongoose.connect('mongodb://pomodoro-api-db/pomodoro')

var users

db(function(conn){
  users = conn.collection('users')
})

router.use('/pomodoro', authorizedMiddleware(db, 'users'))

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

    var mongoQuery = PomodoroMongoQueryBuilder()
      .withUser(req.user)
      .withinTimerangeOf(pomodoro)
      .build()

    Pomodoro.count(mongoQuery, function(err, count){
      if(err) return res.sendStatus(500)
      if( count > 0 ) return res.sendStatus(403)

      Pomodoro.create(pomodoro, function(err, pomodoro){
        if(err) return res.sendStatus(500)
        var createdResourceId = pomodoro._id
        res.status(201).location('/api/pomodoro/'+createdResourceId).end()
      })
    })
  })

  router.get('/pomodoro', function(req,res){
    var mongoQuery = PomodoroMongoQueryBuilder()
      .withRequest(req)
      .build()


    Pomodoro.find(mongoQuery, function(err,pomodori){
      if( err ) return res.sendStatus(500)
      res.json(pomodori)
    })
  })

  router.get('/pomodoro/:id', function(req,res){
    try {
      new BSON.ObjectID(req.params.id)
    }catch(e){
      return res.sendStatus(404)
    }

    var mongoQuery = PomodoroMongoQueryBuilder()
      .withRequest(req)
      .build()


    Pomodoro.findOne(mongoQuery, function(err,pomodoro){
      if( err ) return res.sendStatus(500)
      if( !pomodoro ) return res.sendStatus(404)
      res.json(pomodoro)
    })
  })

module.exports = router
