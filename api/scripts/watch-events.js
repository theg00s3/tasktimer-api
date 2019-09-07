#!/usr/bin/env node

require('../env')
console.log('process.env.MONGO_URL', process.env.MONGO_URL)
const MongoClient = require('mongodb').MongoClient

let client

if (require.main === module) {
  const arg = process.argv[2]
  let _id
  let namePattern
  if (arg) {
    if (arg.length === 24) _id = arg
    else namePattern = new RegExp(arg, 'gi')
  }
  main({ _id, namePattern })
    .then(() => {
      process.exit(0)
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}

module.exports = main

async function main ({ _id, namePattern }) {
  const query = {}
  if (_id) {
    query._id = _id
  }
  if (namePattern) {
    query.name = { $regex: namePattern }
  }

  client = new MongoClient(process.env.MONGO_URL.replace('/test', ''), { useNewUrlParser: true })

  await client.connect()

  console.log('Connected successfully to server')

  const dbName = 'test'
  const db = client.db(dbName)
  const eventsColl = db.collection('events')

  console.log('watching collection')
  return new Promise(() => {
    eventsColl.watch([{
      $match: query
    }])
      .on('changed', () => {
        console.log('changed')
      })
  })
}
