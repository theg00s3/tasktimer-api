const logger = require('pino')()
const Todo = require('../models/Todo')
const Event = require('../models/Event')
const ValidationError = require('../errors/validation')
const todoValidationErrors = require('../modules/todo-validation-errors')

module.exports = {
  createUserTodo
}

async function createUserTodo ({ user, todo }) {
  await Event.insert({ name: 'createTodo', createdAt: new Date(), user, todo }).catch(Function.prototype)

  const errors = todoValidationErrors(todo)
  logger.info('todo, errors', todo, errors)
  if (errors === null) {
    Object.assign(todo, { user })
    await Todo.insert(todo)
    await Event.insert({ name: 'todoCreated', createdAt: new Date(), user, todo }).catch(Function.prototype)
    return todo
  } else {
    await Event.insert({ name: 'todoFailedValidation', createdAt: new Date(), user, todo }).catch(Function.prototype)
    throw new ValidationError(errors)
  }
}
