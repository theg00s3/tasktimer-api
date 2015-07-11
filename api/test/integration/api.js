var expect = require('chai').expect
  , async = require('async')
  , moment = require('moment')
  , constants = require('../../constants')
  , app = require('../../index')
  , constants = require('../../constants')
  , db = require('../../modules/db.connection')
  , request = require('supertest')


var apikey = 'fake'
var fakeUser = {apikey:apikey}
var now = Date.now()
  , day = moment(now).format(constants.dayFormat)
  , week = moment(now).format(constants.weekFormat)

var pomodoro = {'minutes':25,'startedAt':now,'type':'pomodoro','day':day,'week':week,'tags':[],'distractions':[]}

describe('PomodoroApi', function(){
  beforeEach(function (done) {
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

  it('returns single pomodoro by id', function (done) {
    request(app)
    .get('/api/pomodoro/'+pomodoro._id+'?apikey='+apikey)
    .expect(200)
    .expect(function(res){
      var _pomodoro = res.body
      expectSamePomodori(_pomodoro, pomodoro)
    })
    .end(done)
  })

  it('creates a pomodoro and returns location', function (done) {
    db(function(conn){
      conn.collection('pomodori').drop(function(){
        request(app)
        .post('/api/pomodoro/?apikey='+apikey)
        .send(pomodoro)
        .expect(201)
        .expect('Location', /\/api\/pomodoro\/[a-z0-9]/)
        .end(done)
      })
    })
  })

  it('refuses to add the same pomodoro', function (done) {
    request(app)
    .post('/api/pomodoro/?apikey='+apikey)
    .send(pomodoro)
    .expect(409,done)
  })

  it('returns 422 and errors for invalid pomodoro', function (done) {
    request(app)
    .post('/api/pomodoro/?apikey='+apikey)
    .send({foo:'bar'})
    .expect(422,done)
  })

  it('returns 404 for unexisting pomodoro resource', function (done) {
    request(app)
    .get('/api/pomodoro/123123123?apikey='+apikey)
    .expect(404,done)
  })

  it('returns pomodori for authorized user with api key', function (done) {
    request(app)
    .get('/api/pomodoro?apikey='+apikey)
    .expect(200)
    .expect(function(res){
      var pomodori = res.body
      expectSamePomodori(pomodori, [pomodoro])
    })
    .end(done)
  })

  it('returns pomodori for day', function (done) {
    request(app)
    .get('/api/pomodoro?day='+day+'&apikey='+apikey)
    .expect(200)
    .expect(function(res){
      var pomodori = res.body
      expectSamePomodori(pomodori, [pomodoro])
    })
    .end(done)
  })

  it('returns pomodori for week', function (done) {
    request(app)
    .get('/api/pomodoro?week='+week+'&apikey='+apikey)
    .expect(200)
    .expect(function(res){
      var pomodori = res.body
      expectSamePomodori(pomodori, [pomodoro])
    })
    .end(done)
  })

  function expectSamePomodori(pom1, pom2){
    if( pom1 instanceof Array )
      delete pom1[0]._id
    else
      delete pom1._id
    if( pom2 instanceof Array )
      delete pom2[0]._id
    else
      delete pom2._id
    return expect(pom1).to.deep.equal(pom2)
  }

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
