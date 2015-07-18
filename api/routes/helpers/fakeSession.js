module.exports = function(router){
  router.use(require('../middlewares/fakeSession'))
  router.get('/auth/fake', require('./fakeAuth.js'))
}