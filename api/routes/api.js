var router = require('express').Router()
  , Pomodoro = require('../models/Pomodoro')
  , PomodoroBuilder = require('../modules/PomodoroBuilder')
  , PomodoroMongoQueryBuilder = require('../modules/PomodoroMongoQueryBuilder')
  , authorizedMiddleware = require('./middleware/authorized')
  , BSON = require('mongodb').BSONPure

router.use('/pomodoro', authorizedMiddleware)

  router.post('/pomodoro', function(req,res){
    var pomodoro = PomodoroBuilder()
      .withData(req.body)
      .withUser(req.user.id)
      .build()

    var overlappingPomodoroQuery = PomodoroMongoQueryBuilder()
      .withUser(req.user)
      .withinTimerangeOf(pomodoro)
      .build()

    Pomodoro.count(overlappingPomodoroQuery, function(err, count){
      if( err ){ return res.sendStatus(500) }
      if( count > 0 ){
        return res.status(403).json({
          info: 'Pomodoro overlaps with others',
          data: pomodoro
        })
      }

      Pomodoro.create(pomodoro, function(err, createdPomodoro){
        if( err ){
          return res.status(422).json( formatValidationErrors(err) )
        }
        var createdResourceId = createdPomodoro._id
        res.status(201).location('/api/pomodoro/'+createdResourceId).end()
      })
    })
  })

  function formatValidationErrors(err) {
    var rawErrors = err.errors
    var errors = {}
    for(var key in rawErrors){
      var error = rawErrors[key]
      errors[key] = error.kind
    }
    return errors
  }

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