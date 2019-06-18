const logger = require('pino')()
const monk = require('monk')
const Todo = require('../models/Todo')
const Event = require('../models/Event')
const ValidationError = require('../errors/validation')
const todoValidationErrors = require('../modules/todo-validation-errors')

module.exports = {
  updateUserTodo
}

async function updateUserTodo ({ user, todo }) {
  logger.info('updateUserTodo', user, todo)
  const userId = monk.id(user._id)
  await Event.insert({ name: 'updateTodo', createdAt: new Date(), user, todo }).catch(Function.prototype)

  const errors = todoValidationErrors(todo)
  logger.info('todo, errors', todo, errors)
  if (errors === null) {
    Object.assign(todo, { userId })
    console.log('todo', todo)
    await Todo.update({ _id: todo._id }, { $set: todo })

    await Event.insert({ name: 'todoUpdated', createdAt: new Date(), user, todo }).catch(Function.prototype)
    return todo
  } else {
    await Event.insert({ name: 'todoFailedValidation', createdAt: new Date(), user, todo }).catch(Function.prototype)
    throw new ValidationError(errors)
  }
}
