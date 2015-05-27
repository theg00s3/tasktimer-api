var utils = require('../modules/utils')
  , _ = require('underscore')
  , async = require('async')

var pomodoriColl

var cache = {
  hours: 0,
  pomodori: 0,
  breaks: 0,
  users: 0,
}


module.exports = {
  use: function(db,callback){
    db(function(conn){
      pomodoriColl = conn.collection('pomodori')

      doCache(callback)
      setInterval(doCache, 1000*60*25)
    })
  },
  getAll: getAll,
}

function getAll(callback){
  callback(cache)
}

function doCache(callback){
  async.parallel([
    function(done){
      pomodoriColl.find({}).toArray(function(err,pomodori){
        done()
        if( err ){ return }
        cache.hours = getPomodoriHours(pomodori)
        cache.pomodori = getCountByType('pomodoro',pomodori)
        cache.breaks = getCountByType('break',pomodori)
      })
    },
    function(done){
      pomodoriColl.distinct('username', function(err,users){
        done()
        if( err ){ return }
        cache.users = users.length
      })
    }
  ], function(){
    if( callback ){ callback() }
  })
}

function getPomodoriHours(pomodori){
  var hours = _.reduce(pomodori, function(memo, pomodoro){
    if( utils.isPartial(pomodoro) ){
      memo += ((pomodoro.cancelledAt-pomodoro.startedAt) / (60*1000)) / 60
    }else{
      memo += pomodoro.minutes / 60
    }
    return memo
  }, 0)
  return utils.trimDecimals(hours,1)
}

function getCountByType(type, pomodori){
  var count = _.reduce(pomodori, function(memo, pomodoro){
    if( pomodoro.type && pomodoro.type.match && pomodoro.type.match(type) ){
      if( utils.isPartial(pomodoro) ){
        memo += (pomodoro.cancelledAt-pomodoro.startedAt) / (pomodoro.minutes*60*1000)
      }else{
        memo += 1
      }
    }
    return memo
  }, 0)
  return utils.trimDecimals(count,1)
}
