module.exports = function(router){
  router.use(require('../middlewares/fakeSession'))
  router.get('/fake', require('./fakeAuth.js'))
}