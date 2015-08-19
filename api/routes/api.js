var router = require('express').Router()
  , BSON = require('mongodb').BSONPure
  , PomodoroValidator = require('../modules/PomodoroValidator')
  , PomodoroBuilder = require('../modules/PomodoroBuilder')
  , PomodoroMongoQueryBuilder = require('../modules/PomodoroMongoQueryBuilder')
  , authorizedMiddleware = require('./middleware/authorized')
  , Pomodoro = require('../models/Pomodoro')

router.use('/pomodoro', authorizedMiddleware)

  router.post('/pomodoro', function(req,res){
    var pomodoro = PomodoroBuilder()
      .withData(req.body)
      .withUser(req.user.id)
      .build()

    var mongoQuery = PomodoroMongoQueryBuilder()
      .withUser(req.user)
      .withinTimerangeOf(pomodoro)
      .build()

    Pomodoro.count(mongoQuery, function(err, count){
      if( err ){
        return res.sendStatus(500)
      }
      if( count > 0 ){
        return res.sendStatus(403)
      }

      Pomodoro.create(pomodoro, function(err, pomodoro){
        if( err ){
          var rawErrors = err.errors
          var errors = {}
          for(var key in rawErrors){
            var error = rawErrors[key]
            errors[key] = error.kind
          }
          return res.status(422).json(errors)
        }
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
      if( err ){
        return res.sendStatus(500)
      }
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

    Pomodoro.findOne(mongoQuery, function(err, pomodoro){
      if( err ){
        return res.sendStatus(500)
      }
      if( pomodoro === null || pomodoro === undefined ){
        return res.sendStatus(404)
      }

      res.json(pomodoro)
    })
  })

module.exports = router