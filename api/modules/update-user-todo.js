const logger = require('pino')()
const Todo = require('../models/Todo')
const Event = require('../models/Event')
const ValidationError = require('../errors/validation')
const todoValidationErrors = require('../modules/todo-validation-errors')

module.exports = {
  updateUserTodo
}

async function updateUserTodo ({ user, todo }) {
  const userId = user._id
  await Event.insert({ name: 'updateTodo', updatedAt: new Date(), user, todo }).catch(Function.prototype)

  const errors = todoValidationErrors(todo)
  logger.info('todo, errors', todo, errors)
  if (errors === null) {
    Object.assign(todo, { userId })
    if (todo.completedAt) {
      Object.assign(todo, { completedAt: new Date(todo.completedAt) })
    }
    if (todo.deletedAt) {
      Object.assign(todo, { deletedAt: new Date(todo.deletedAt) })
    }
    await Todo.update({ _id: todo._id }, { $set: todo })

    await Event.insert({ name: 'todoUpdated', updatedAt: new Date(), user, todo }).catch(Function.prototype)
    return todo
  } else {
    await Event.insert({ name: 'todoFailedValidation', updatedAt: new Date(), user, todo }).catch(Function.prototype)
    throw new ValidationError(errors)
  }
}
