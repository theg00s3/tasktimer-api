var expect = require('chai').expect
  , async = require('async')
  , moment = require('moment')
  , constants = require('../../constants')
  , db = require('../../modules/db.connection')
  , Statistics = require('../../modules/Statistics')
  , PomodoroAnonPropPicker = require('../../modules/PomodoroAnonPropPicker')


var now = Date.now()
  , notIncludedNow = now - 1000*60*60*24
  , day = moment(now).format(constants.dayFormat)
  , notIncludedDay = moment(notIncludedNow).format(constants.dayFormat)
  , week = moment(now).format(constants.weekFormat)
  , notIncludedWeek = moment(notIncludedNow).format(constants.weekFormat)
  , users = {
    user1: {username:'fake1'},
    user2: {username:'fake2'},
  }
  , pomodori = {
    pomodoro1user1: {'username':users.user1.username,'minutes':25,'startedAt':now,'type':'pomodoro','day':day,'week':week,'tags':[],'distractions':[]},
    pomodoro2user1: {'username':users.user1.username,'minutes':5,'startedAt':notIncludedNow,'type':'break','day':notIncludedDay,'week':notIncludedWeek,'tags':[],'distractions':[]},
    pomodoro1user2: {'username':users.user2.username,'minutes':25,'startedAt':now,'type':'pomodoro','day':day,'week':week,'tags':[],'distractions':[]},
    pomodoro2user2: {'username':users.user2.username,'minutes':25,'startedAt':now,'cancelledAt':now+1000*60*10,'type':'pomodoro','day':day,'week':week,'tags':[],'distractions':[]}
  }


describe('Statistics', function(){
  beforeEach(function (done) {
    db(function(conn){
      async.parallel([
        function(cb){conn.collection('pomodori').insert(pomodori.pomodoro1user1,cb)},
        function(cb){conn.collection('pomodori').insert(pomodori.pomodoro2user1,cb)},
        function(cb){conn.collection('pomodori').insert(pomodori.pomodoro1user2,cb)},
        function(cb){conn.collection('pomodori').insert(pomodori.pomodoro2user2,cb)},
        function(cb){conn.collection('users').insert(users.user1,cb)},
        function(cb){conn.collection('users').insert(users.user2,cb)},
      ],function(){ Statistics.use(db,done) })
    })
  })



  it('gets all statistics', function(done) {
    Statistics.getAll(function(statistics){
      expect( statistics.hours ).to.eql(1)
      expect( statistics.pomodori ).to.eql(2.4)
      expect( statistics.breaks ).to.eql(1)
      done()
    })
  })


  afterEach(function(done){
    db(function(conn){
      async.parallel([
        function(cb) {conn.collection('pomodori').drop(cb)},
        function(cb) {conn.collection('users').drop(cb)},
      ], function(){
        conn.close()
        done()
      })
    })
  })
})
