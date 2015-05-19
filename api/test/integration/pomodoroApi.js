var expect = require('chai').expect
  , async = require('async')
  , moment = require('moment')
  , app = require('../../index')
  , constants = require('../../constants')
  , db = require('../../modules/db.connection')
  , request = require('supertest')


var fakeUser = {apikey:'fake'}

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

})
