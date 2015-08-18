var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema({
  apikey: {type: String, required: true},
  id: {type: Number, required: true},
  avatar: {type: String, required: true},
  username: {type: String, required: true},
}, {collection: 'users'})

var User = mongoose.model('User', UserSchema)

module.exports = User