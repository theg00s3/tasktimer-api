var config = require('config')
  , mongoose = require('mongoose')

module.exports = function(){
  return mongoose.connect(config.get('mongodb.url'))
}
