var expect = require('chai').expect
  , app = require('../../')
  , request = require('supertest')

describe('auth', function(){
  it('logs in test user', function (done) {
    request(app)
      .get('/auth/fake')
      .expect('Location', '/')
      .expect(302,done)
  })
})
