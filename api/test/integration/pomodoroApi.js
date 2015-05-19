var expect = require('chai').expect
  , async = require('async')
  , moment = require('moment')
  , app = require('../../index')
  , constants = require('../../constants')
  , db = require('../../modules/db.connection')
  , request = require('supertest')


var apikey = 'fake'
var fakeUser = {apikey:apikey}

describe('PomodoroApi', function(){
  before(function (done) {
    db(function(conn){
      async.parallel([
        function(cb){conn.collection('users').drop(cb)},
        function(cb){conn.collection('users').insert(fakeUser,cb)},
      ], done)
    })
  })

  it('returns 401 for unauthorized user accessing /pomodoro', function(done){
    request(app)
    .get('/api/pomodoro')
    .expect(401, done)
  })

  it('returns authorizes user with api key', function (done) {
    request(app)
    .get('/api/pomodoro?apikey='+apikey)
    .expect(200)
    .expect([], done)
  });

})
