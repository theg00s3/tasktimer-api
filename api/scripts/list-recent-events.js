#!/usr/bin/env node

require('../env')
console.log('process.env.MONGO_URL', process.env.MONGO_URL)
const Event = require('../models/Event')
const chalk = require('chalk')
const stringToColor = require('string-to-color')

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

  const events = await Event.find(query, { limit: 500, sort: { createdAt: -1 } })
  events
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach(printEvent)
}

function printEvent (e) {
  console.log(eventToString(e))
}

function eventToString (e) {
  const createdAt = e.createdAt
  const username = e.user && e.user.username
  const eventName = e.name
  const additionalInfo = additionalInfoFor(e)
  const userId = e.user && e.user._id

  return `${chalk.blue(createdAt)} ${chalk.white(e._id)} ${chalk.hex(stringToColor(eventName)).bold(eventName)} by user ${chalk.yellow(username)} ${userId} ${additionalInfo}`
}

function additionalInfoFor (e) {
  if (e.name === 'createUserSucceeded') {
    return ''
  }
  if (e.name === 'userAuthenticated') {
    return ''
  }
  if (e.name === 'createPomodoro') {
    return ''
  }
  if (e.name === 'pomodoroFailedValidation') {
    return `\n\terrors: ${(e.errors || []).join(', ')}\n\tpomodoro: ${JSON.stringify(e.pomodoro || {})}`
  }
  if (e.name === 'todoFailedValidation') {
    return `\n\terrors: ${(e.errors || []).join(', ')}\n\ttodo: ${JSON.stringify(e.todo || {})}`
  }
  return ''
}
