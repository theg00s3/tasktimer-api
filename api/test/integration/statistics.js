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
    user1: {},
    user2: {},
  }
  , pomodori = {
    pomodoro1user1: {'username':'test','minutes':25,'startedAt':now,'type':'pomodoro','day':day,'week':week,'tags':[],'distractions':[]},
    pomodoro2user1: {'username':'test','minutes':5,'startedAt':notIncludedNow,'type':'break','day':notIncludedDay,'week':notIncludedWeek,'tags':[],'distractions':[]},
    pomodoro1user2: {'username':'test1','minutes':25,'startedAt':now,'type':'pomodoro','day':day,'week':week,'tags':[],'distractions':[]},
    pomodoro2user2: {'username':'test1','minutes':25,'startedAt':now,'cancelledAt':now+1000*60*10,'type':'pomodoro','day':day,'week':week,'tags':[],'distractions':[]}
  }


describe('Statistics', function(){
  before(function (done) {
    db(function(conn){
      async.parallel([
        function(cb) {conn.collection('pomodori').remove(cb)},
        function(cb) {conn.collection('users').remove(cb)},
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
      expect( statistics ).to.deep.equal({
        hours: 1,
        pomodori: 2.4,
        breaks: 1,
        users: Object.keys(users).length
      })
      done()
    })
  })


  after(function(done){
    db(function(conn){
      async.parallel([
        function(cb) {conn.collection('pomodori').remove(cb)},
        function(cb) {conn.collection('users').remove(cb)},
      ], function(){
        conn.close()
        done()
      })
    })
  })
})
