#!/usr/bin/env node

require('../env')
console.log('process.env.MONGO_URL', process.env.MONGO_URL)
const OAuth = require('oauth')
const User = require('../models/User')

if (require.main === module) {
  main()
    .then(res => {
      console.log(res)
      process.exit(0)
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}

async function main () {
  var oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.TWITTER_CONSUMER_KEY,
    process.env.TWITTER_CONSUMER_SECRET,
    '1.0A', null, 'HMAC-SHA1'
  )

  const count = await User.count({ twitterAvatarNotFound: { $exists: false }, $or: [{ twitterAvatarUpdatedAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } }, { twitterAvatarUpdatedAt: { $exists: false } }] })
  console.log('count', count)

  await User.find({ twitterAvatarNotFound: { $exists: false }, $or: [{ twitterAvatarUpdatedAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } }, { twitterAvatarUpdatedAt: { $exists: false } }] })
    .each(async (doc, { pause, resume }) => {
      pause()
      const { username } = doc
      if (!username) {
        console.info('❌  no username not found', doc._id)
        return resume()
      }
      const avatar = await getTwitterAvatarUrlByUsername(username).catch(() => {})
      if (!avatar) {
        console.info('⚠️  avatar not found', username)
        await User.findOneAndUpdate({ _id: doc._id }, { $set: { twitterAvatarNotFound: true } })

        return resume()
      }

      console.log('username', username, avatar)
      await User.findOneAndUpdate({ _id: doc._id }, { $set: { avatar, twitterAvatarUpdatedAt: new Date() } })
      console.log('✅  -> updated', username, avatar)
      resume()
    })
    .catch(err => {
      console.error(err)
    })

  async function getTwitterAvatarUrlByUsername (username) {
    return new Promise((resolve, reject) => {
      oauth.get(
        `https://api.twitter.com/1.1/users/show.json?screen_name=${username}`,
        process.env.TWITTER_ACCESS_KEY,
        process.env.TWITTER_ACCESS_TOKEN_SECRET,
        function (e, data, res) {
          if (e) {
            // console.error(e)
            return reject(e)
          }
          const json = JSON.parse(data)
          // console.log('tw response', json.profile_image_url)
          resolve(json.profile_image_url)
        })
    })
  }
}
