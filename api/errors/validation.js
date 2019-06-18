const util = require('util')

function ValidationError (errors) {
  this.msg = `errors: ${(errors || []).join(', ')}`
  this.errors = errors
}

util.inherits(ValidationError, Error)

module.exports = ValidationError
