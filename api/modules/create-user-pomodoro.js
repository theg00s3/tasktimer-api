const logger = require('pino')()
const pomodoroValidationErrors = require('./pomodoro-validation-errors')
const Pomodoro = require('../models/Pomodoro')
const Event = require('../models/Event')
const monk = require('monk')
const DuplicateError = require('../errors/duplicate')

module.exports = {
  createUserPomodoro
}

async function createUserPomodoro ({ user, pomodoro }) {
  logger.info('createUserPomodoro', user, pomodoro)
  const userId = monk.id(user._id)
  Object.assign(pomodoro, { startedAt: new Date(pomodoro.startedAt) })

  await Event.insert({ name: 'createPomodoro', createdAt: new Date(), user, pomodoro }).catch(Function.prototype)

  const errors = pomodoroValidationErrors(pomodoro)
  logger.info('pomodoro, errors', pomodoro, errors)

  if (errors) {
    logger.info('pomodoro validation errors', errors)
    await Event.insert({ name: 'pomodoroFailedValidation', createdAt: new Date(), user, pomodoro, errors }).catch(Function.prototype)
    throw errors
  }

  const duplicateCount = await Pomodoro.count({ userId, startedAt: pomodoro.startedAt })
  logger.info('duplicateCount', duplicateCount)
  if (duplicateCount > 0) {
    logger.info('found duplicate pomodoro', duplicateCount)
    await Event.insert({ name: 'pomodoroDuplicate', createdAt: new Date(), user, pomodoro }).catch(Function.prototype)
    throw new DuplicateError(duplicateCount)
  }

  Object.assign(pomodoro, { userId })
  Object.assign(pomodoro, { startedAt: new Date(pomodoro.startedAt) })
  if (pomodoro.cancelledAt) {
    Object.assign(pomodoro, { cancelledAt: new Date(pomodoro.cancelledAt) })
  }

  logger.info('inserting pomodoro', pomodoro)
  await Pomodoro.insert(pomodoro)
  await Event.insert({ name: 'pomodoroCreated', createdAt: new Date(), user, pomodoro }).catch(Function.prototype)
  return pomodoro
}
