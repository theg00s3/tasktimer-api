var config = require('config')
  , mongoose = require('mongoose')
mongoose.Promise = require('bluebird')


module.exports = function(){
  return mongoose.connect(config.get('mongodb.url'))
}
