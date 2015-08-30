var mongoose = require('mongoose')
var Schema =mongoose.Schema

var PomodoroSchema = new Schema({
  minutes: {type: Number, enum: [5,15,25], required: true},
  startedAt: {type: Date, required: true},
  cancelledAt: {type: Date, required: false},
  type: {type: String, enum: ['break','pomodoro'], required: true},
  tags: {type: Array, default: [], required: false},
  distractions: {type: Array, default: [], required: false},
  userId: {type: Number, required: true},
}, {collection: 'pomodori'})

PomodoroSchema.pre('save', function(next){
  if( this.cancelledAt !== undefined ) {
    if( this.cancelledAt <= this.startedAt ) {
      next( Error('Pomodoro date error:' + this) )
      return
    }
  }
  next()
})

var Pomodoro = mongoose.model('Pomodoro', PomodoroSchema)


module.exports = Pomodoro
