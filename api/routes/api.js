var router = require('express').Router()
  , request = require('request')
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
      .buildModel()

    var overlappingPomodoroQuery = PomodoroMongoQueryBuilder()
      .withUser(req.user)
      .withinTimerangeOf(pomodoro)
      .build()

    Pomodoro.find(overlappingPomodoroQuery).exec()
    .then(function(conflicts){
      if( conflicts.length > 0 ){
        return res.status(403).json({
          info: 'Pomodoro overlaps with others',
          conflicts: conflicts
        })
      }
      return pomodoro.save()
    })
    .then(respond(res, function(createdPomodoro){
      res
        .status(201)
        .location('/api/pomodoro/'+createdPomodoro._id)
        .end()
    }))
    .catch(respond(res, function(err){
      res
        .status(422)
        .json( formatValidationErrors(err) )
    }))
    .catch(respond(res, function(err){
      res.sendStatus(500)
    }))
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


function respond(res, fn) {
  return function(){
    if( res.headersSent ) { return }
    fn.apply(fn, arguments)
  }
}

function formatValidationErrors(err) {
  var rawErrors = err.errors
  var errors = {}
  for(var key in rawErrors){
    var error = rawErrors[key]
    errors[key] = error.kind
  }
  return errors
}

module.exports = router
