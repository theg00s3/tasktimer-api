#!/usr/bin/env node

require('../env')
// console.log('process.env.MONGO_URL', process.env.MONGO_URL)
const OAuth = require('oauth')
const User = require('../models/User')

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => console.error(err) && process.exit(1))
} else {
  module.exports = main
}

async function main () {
  var oauth = createOAuth()

  const count = await User.count({ twitterAvatarNotFound: { $exists: false }, $or: [{ twitterAvatarUpdatedAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } }, { twitterAvatarUpdatedAt: { $exists: false } }] })
  console.log('count', count)

  await User.find({ twitterAvatarNotFound: { $exists: false }, $or: [{ twitterAvatarUpdatedAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } }, { twitterAvatarUpdatedAt: { $exists: false } }] })
    .each(async (user, { pause, resume }) => {
      pause()

      if (!user.username) {
        console.log('❌  no username not found', user._id)
        return resume()
      }

      const avatar = await getTwitterAvatarUrlByUsername(user.username, oauth).catch(() => {})
      if (!avatar) {
        console.log('⚠️  avatar not found', user.username)
        await User.findOneAndUpdate({ _id: user._id }, { $set: { twitterAvatarNotFound: true } })
        return resume()
      }

      await User.findOneAndUpdate({ _id: user._id }, { $set: { avatar, twitterAvatarUpdatedAt: new Date() } })
      console.log('✅  -> updated', user.username, avatar)
      resume()
    })
    .catch(err => console.error(err))
}

function createOAuth () {
  return new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.TWITTER_CONSUMER_KEY,
    process.env.TWITTER_CONSUMER_SECRET,
    '1.0A', null, 'HMAC-SHA1'
  )
}

async function getTwitterAvatarUrlByUsername (username, oauth) {
  return new Promise((resolve, reject) => {
    oauth.get(`https://api.twitter.com/1.1/users/show.json?screen_name=${username}`,
      process.env.TWITTER_ACCESS_KEY,
      process.env.TWITTER_ACCESS_TOKEN_SECRET,
      function (e, data) {
        return e ? reject(e) : resolve(JSON.parse(data).profile_image_url)
      })
  })
}
