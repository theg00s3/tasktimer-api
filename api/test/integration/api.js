var expect = require('chai').expect
  , async = require('async')
  , moment = require('moment')
  , app = require('../../index')
  , constants = require('../../constants')
  , mongoose = require('mongoose')
  , config = require('config')
  , request = require('supertest')


var apikey = 'fake'
var userId = 123456
var fakeUser = {apikey:apikey, id:userId}
var timestampNow = Date.now()
  , dateNow = moment(timestampNow).toDate()
  , dateNow1 = moment(timestampNow).add(1,'hour').toDate()
  , dateNow2 = moment(timestampNow).add(2,'hour').toDate()
  , day = moment(timestampNow).format(constants.dayFormat)

var pomodoro1 = {'minutes':25,'startedAt':dateNow,'type':'pomodoro','tags':[],'distractions':[],userId: userId}
var pomodoro2 = {'minutes':15,'startedAt':dateNow1,'type':'break','tags':[],'distractions':[],userId: userId}
var pomodoro3 = {'minutes':25,'startedAt':dateNow2,'type':'pomodoro','tags':[],'distractions':[],userId: userId}
var pomodori = [pomodoro1, pomodoro2]

describe('PomodoroApi', function(){
  var conn
  beforeEach(function (done) {
    conn = mongoose.createConnection(config.get('mongodb.url'))
    async.parallel([
      function(cb){conn.collection('users').insert(fakeUser,cb)},
      function(cb){conn.collection('pomodori').insert(pomodoro1,cb)},
      function(cb){conn.collection('pomodori').insert(pomodoro2,cb)},
    ], done)
  })

  it('returns 401 for unauthorized user accessing /pomodoro', function(done){
    request(app)
    .get('/api/pomodoro')
    .expect(401, done)
  })

  it('returns single pomodoro by id', function (done) {
    request(app)
    .get('/api/pomodoro/'+pomodoro1._id+'?apikey='+apikey)
    .expect(200)
    .expect(function(res){
      var _pomodoro = res.body
      expect( _pomodoro._id ).to.eql(''+pomodoro1._id)
    })
    .end(done)
  })

  it('creates a pomodoro and returns location', function (done) {
    request(app)
    .post('/api/pomodoro/?apikey='+apikey)
    .send(pomodoro3)
    .expect(201)
    .expect('Location', /\/api\/pomodoro\/[a-z0-9]/)
    .end(done)
  })

  it('refuses to create overlapping pomodoro', function (done) {
    request(app)
    .post('/api/pomodoro/?apikey='+apikey)
    .send(pomodoro1)
    .expect(403)
    .end(done)
  })

  it('returns 422 and errors for invalid pomodoro', function (done) {
    request(app)
    .post('/api/pomodoro/?apikey='+apikey)
    .send({foo:'bar'})
    .expect(422)
    .expect(function(res){
      var errors = res.body
      expect( errors.minutes ).to.eql('required')
      expect( errors.type ).to.eql('required')
    })
    .end(done)
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
      var _pomodori = res.body
      expect(_pomodori.length).to.eql(2)
    })
    .end(done)
  })

  it('returns pomodori for day', function (done) {
    request(app)
    .get('/api/pomodoro?day='+day+'&apikey='+apikey)
    .expect(200)
    .expect(function(res){
      var _pomodori = res.body
      expect(_pomodori.length).to.eql(2)
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
    async.parallel([
      function(cb) {conn.collection('pomodori').drop(cb)},
      function(cb) {conn.collection('users').drop(cb)},
    ], function(){
      conn.close()
      done()
    })
  })
})
