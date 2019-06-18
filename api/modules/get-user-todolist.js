const logger = require('pino')()
const Todo = require('../models/Todo')
const Event = require('../models/Event')
const TodoQueryBuilder = require('../modules/TodoQueryBuilder')

module.exports = {
  getUserTodolist
}

async function getUserTodolist ({ user }) {
  logger.info('getUserTodolist', user._id, user.username)
  await Event.insert({ name: 'getUserTodolist', createdAt: new Date(), user }).catch(Function.prototype)

  const query = TodoQueryBuilder()
    .withUser(user)
    .withDeleted(false)

  logger.info('todolist query for user', JSON.stringify(query), user._id, user.username)

  return Todo.find(query)
}
