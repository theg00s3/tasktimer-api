const todos = require('../app')
const todosFactory = require('./todos-factory')

todos.use(todosFactory)

module.exports = todos
