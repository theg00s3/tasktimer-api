const logger = require('pino')()
const monk = require('monk')
const Todo = require('../models/Todo')
const Event = require('../models/Event')
const ValidationError = require('../errors/validation')
const todoValidationErrors = require('../modules/todo-validation-errors')

module.exports = {
  createUserTodo
}

async function createUserTodo ({ user, todo }) {
  const userId = monk.id(user._id)
  await Event.insert({ name: 'createTodo', createdAt: new Date(), user, todo }).catch(Function.prototype)

  const errors = todoValidationErrors(todo)
  logger.info('todo, errors', todo, errors)
  if (errors === null) {
    Object.assign(todo, { userId })
    if (todo.completedAt) {
      Object.assign(todo, { completedAt: new Date(todo.completedAt) })
    }
    if (todo.completed_at) {
      Object.assign(todo, { completedAt: new Date(todo.completed_at) })
      delete todo.completed_at
    }
    if (todo.createdAt) {
      Object.assign(todo, { createdAt: new Date(todo.createdAt) })
    }
    if (todo.deletedAt) {
      Object.assign(todo, { deletedAt: new Date(todo.deletedAt) })
    }
    if (todo.deleted_at) {
      Object.assign(todo, { deletedAt: new Date(todo.deleted_at) })
      delete todo.deleted_at
    }
    await Todo.insert(todo)

    await Event.insert({ name: 'todoCreated', createdAt: new Date(), user, todo }).catch(Function.prototype)
    return todo
  } else {
    await Event.insert({ name: 'todoFailedValidation', createdAt: new Date(), user, todo }).catch(Function.prototype)
    throw new ValidationError(errors)
  }
}
