var expect = require('chai').expect
  , async = require('async')
  , moment = require('moment')
  , constants = require('../../constants')
  , app = require('../../index')
  , constants = require('../../constants')
  , db = require('../../modules/db.connection')
  , request = require('supertest')


var apikey = 'fake'
var fakeUser = {username:'fake', apikey:apikey}
var now = Date.now()
  , day = moment(now).format(constants.dayFormat)
  , week = moment(now).format(constants.weekFormat)

var pomodoro = {'username':'fake','minutes':25,'startedAt':now,'type':'pomodoro','day':day,'week':week,'tags':[],'distractions':[]}

describe('PomodoroApi', function(){
  before(function (done) {
    db(function(conn){
      async.parallel([
        function(cb){conn.collection('users').insert(fakeUser,cb)},
        function(cb){conn.collection('pomodori').insert(pomodoro,cb)},
      ], done)
    })
  })

  it('returns 401 for unauthorized user accessing /pomodoro', function(done){
    request(app)
    .get('/api/pomodoro')
    .expect(401, done)
  })

  it('returns pomodori for authorized user with api key', function (done) {
    request(app)
    .get('/api/pomodoro?apikey='+apikey)
    .expect(200)
    .expect(function(res){
      var pomodori = res.body
      delete pomodori[0]._id
      delete pomodoro._id
      return expect(pomodori[0]).to.deep.equal(pomodoro)
    })
    .end(done)
  })

  it('returns pomodori for day', function (done) {
    request(app)
    .get('/api/pomodoro?day='+day+'&apikey='+apikey)
    .expect(200)
    .expect(function(res){
      var pomodori = res.body
      delete pomodori[0]._id
      delete pomodoro._id
      return expect(pomodori[0]).to.deep.equal(pomodoro)
    })
    .end(done)
  })

  // after(function(done){
  //   db(function(conn){
  //     async.parallel([
  //       function(cb) {conn.collection('pomodori').drop(cb)},
  //       function(cb) {conn.collection('users').drop(cb)},
  //     ], function(){
  //       conn.close()
  //       done()
  //     })
  //   })
  // })
})
