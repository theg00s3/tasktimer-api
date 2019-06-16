const api = require('../app')
const Todo = require('../models/Todo')
const ValidationError = require('../errors/validation')
const TodoQueryBuilder = require('../modules/TodoQueryBuilder')
const { createUserTodo } = require('../modules/create-user-todo')
const { updateUserTodo } = require('../modules/update-user-todo')
const logger = require('pino')()

module.exports = api

api.get('/todos', async (req, res) => {
  const todosQuery = TodoQueryBuilder().withRequest(req).build()
  logger.info('todosQuery', todosQuery)
  const todos = await Todo.find(todosQuery)
  logger.info('todos', todos)
  res.json(todos)
})

api.post('/todos', async (req, res) => {
  logger.info('create todo for user', req.user && req.user.username, req.body)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }

  const user = req.user
  const todo = req.body

  await createUserTodo({ user, todo })
    .then((todo) => {
      logger.info(todo)
      res.json(todo)
    })
    .catch(err => {
      logger.error(err)
      if (err instanceof ValidationError) {
        res.writeHead(422)
        return res.end()
      }

      res.writeHead(422)
      return res.end()
    })
})

api.patch('/todos', async (req, res) => {
  logger.info('update todo for user', req.user && req.user.username, req.body)
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }

  const user = req.user
  const todo = req.body

  await updateUserTodo({ user, todo })
    .then((todo) => {
      logger.info(todo)
      res.json(todo)
    })
    .catch(err => {
      logger.error(err)
      if (err instanceof ValidationError) {
        res.writeHead(422)
        return res.end()
      }

      res.writeHead(422)
      return res.end()
    })
})
