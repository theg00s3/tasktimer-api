const util = require('util')

function ValidationError (errors) {
  this.msg = `errors: ${(errors || []).join(', ')}`
}

util.inherits(ValidationError, Error)

module.exports = ValidationError
