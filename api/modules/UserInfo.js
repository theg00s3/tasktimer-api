const crypto = require('crypto')

module.exports = function UserInfo (raw) {
  var self = this

  self.apikey = crypto.randomBytes(20).toString('hex')

  self.username = self.avatar = self.id = null

  self.id = raw.id
  self.customer = raw.customer
  self.subscription = raw.subscription

  switch (raw.provider) {
    case 'twitter':
      self.username = raw.username
      self.avatar = raw._json.profile_image_url_https || raw._json.profile_image_url
      break
    case 'github':
      self.username = raw.username
      self.avatar = raw._json.avatar_url
      break
    default:
  }

  self.toJSON = function () {
    var replacement = {}
    for (var prop in self) {
      if (typeof prop !== 'function') { replacement[prop] = self[prop] }
    }
    return replacement
  }
}
