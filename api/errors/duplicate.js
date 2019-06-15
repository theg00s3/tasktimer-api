const util = require('util')

function DuplicateError (duplicateCount) {
  this.msg = `${duplicateCount} duplicates found`
}

util.inherits(DuplicateError, Error)

module.exports = DuplicateError
