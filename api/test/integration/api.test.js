const { serial: test } = require('ava')
const monk = require('monk')
const fetch = require('node-fetch')
const User = require('../../models/User')
const Pomodoro = require('../../models/Pomodoro')
const Todo = require('../../models/Todo')
const Event = require('../../models/Event')
const fakeUser = require('../fixtures/fake-user')

async function parseJSON (response) {
  return response.text().then(function (text) {
    console.log('text', text)
    try {
      return JSON.parse(text)
    } catch (e) {
      return text
    }
  })
}

test.beforeEach(async () => {
  await Pomodoro.remove({})
  await User.remove({})
  await User.insert(fakeUser)
})

const authCookie = require('../../helpers/before-each-auth-cookie')
let cookie
test.before(async t => { cookie = await authCookie(t) })
test.beforeEach(async () => {
  await Pomodoro.remove({})
  await Todo.remove({})
  await Event.remove({})
})

test('create user pomodoro', async t => {
  const pomodoro = { minutes: 25, type: 'pomodoro', startedAt: new Date() }
  const response = await fetch('http://localhost:3000/pomodoros', {
    method: 'POST',
    json: true,
    body: JSON.stringify(pomodoro),
    credentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      cookie
    }
  })

  const json = await response.json()
  t.is(response.status, 200)
  t.is(json.minutes, 25)
  t.true(new Date(json.startedAt) < new Date())
  t.is(json.type, 'pomodoro')
  t.truthy(json._id)
  t.truthy(json.minutes)
  t.truthy(json.type)
  t.truthy(json.startedAt)

  const events = await Event.find()

  t.is(events.length, 2)
  const createPomodoroEvent = events.find(e => e.name === 'createPomodoro')
  const pomodoroCreatedEvent = events.find(e => e.name === 'pomodoroCreated')
  t.is(createPomodoroEvent.user.username, 'christian-fei')
  t.is(pomodoroCreatedEvent.user.username, 'christian-fei')
  t.truthy(createPomodoroEvent.createdAt)
  t.truthy(pomodoroCreatedEvent.createdAt)
  t.truthy(createPomodoroEvent.pomodoro)
  t.truthy(pomodoroCreatedEvent.pomodoro)
  t.is(createPomodoroEvent.pomodoro.minutes, 25)
  t.is(createPomodoroEvent.pomodoro.type, 'pomodoro')
  t.truthy(new Date(createPomodoroEvent.pomodoro.startedAt))
  t.is(pomodoroCreatedEvent.pomodoro.minutes, 25)
  t.is(pomodoroCreatedEvent.pomodoro.type, 'pomodoro')
  t.truthy(new Date(pomodoroCreatedEvent.pomodoro.startedAt))
  t.truthy(pomodoroCreatedEvent.user.username, 'christian-fei')
})

test('cannot create duplicate user pomodoro (same userId + startedAt)', async t => {
  const pomodoro = { minutes: 25, type: 'pomodoro', startedAt: new Date() }
  const response = await fetch('http://localhost:3000/pomodoros', {
    method: 'POST',
    // json: true,
    body: JSON.stringify(pomodoro),
    credentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      cookie
    }
  })
  t.is(response.status, 200)

  const duplicateResponse = await fetch('http://localhost:3000/pomodoros', {
    method: 'POST',
    body: JSON.stringify(pomodoro),
    credentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      cookie
    }
  })
  t.is(duplicateResponse.status, 409)

  const events = await Event.find()

  t.is(events.length, 4)
  const pomodoroDuplicateEvent = events.find(e => e.name === 'pomodoroDuplicate')
  const pomodoroCreatedEvent = events.find(e => e.name === 'pomodoroCreated')
  t.is(pomodoroDuplicateEvent.user.username, 'christian-fei')
  t.truthy(pomodoroDuplicateEvent.createdAt)
  t.truthy(pomodoroDuplicateEvent.pomodoro)
  t.is(pomodoroDuplicateEvent.pomodoro.minutes, 25)
  t.is(pomodoroDuplicateEvent.pomodoro.type, 'pomodoro')
  t.truthy(new Date(pomodoroDuplicateEvent.pomodoro.startedAt))
  t.is(pomodoroCreatedEvent.user.username, 'christian-fei')
  t.truthy(pomodoroCreatedEvent.createdAt)
  t.truthy(pomodoroCreatedEvent.pomodoro)
  t.is(pomodoroCreatedEvent.pomodoro.minutes, 25)
  t.is(pomodoroCreatedEvent.pomodoro.type, 'pomodoro')
  t.truthy(new Date(pomodoroCreatedEvent.pomodoro.startedAt))
})

test('retrieve user pomodoros', async t => {
  const pomodoro = { '_id': monk.id('5cf6c7ff8985d5f68443f7e3'), 'minutes': 25, 'type': 'pomodoro', 'startedAt': new Date('2019-06-04T19:35:27.255Z'), 'userId': monk.id('5a9fe4e085d766000c002636') }
  await Pomodoro.insert(pomodoro)
  const pomodoroOtherUser = { '_id': monk.id(), 'minutes': 25, 'type': 'pomodoro', 'startedAt': new Date('2019-06-04T19:35:27.255Z'), 'userId': monk.id() }
  await Pomodoro.insert(pomodoroOtherUser)

  const response = await fetch('http://localhost:3000/pomodoros', {
    method: 'GET',
    json: true,
    credentials: true,
    headers: {
      'Accept': 'application/json',
      cookie
    }
  })

  const json = await parseJSON(response)
  t.truthy(json)
  t.is(response.status, 200)
  t.is(json.length, 1)
  t.is(json[0].minutes, 25)
  t.true(new Date(json[0].startedAt) < new Date())
  t.is(json[0].type, 'pomodoro')
  t.truthy(json[0]._id)
  t.truthy(json[0].userId)
})

test('retrieve user pomodoros by time range', async t => {
  const pomodoro1 = { '_id': monk.id('5cf6c7ff8985d5f68443f7e3'), 'minutes': 25, 'type': 'pomodoro', 'startedAt': new Date('2019-06-04T19:35:27.255Z'), 'userId': monk.id('5a9fe4e085d766000c002636') }
  await Pomodoro.insert(pomodoro1)
  const pomodoro2 = { '_id': monk.id(), 'minutes': 25, 'type': 'pomodoro', 'startedAt': new Date('2019-06-01T19:35:27.255Z'), 'userId': monk.id('5a9fe4e085d766000c002636') }
  await Pomodoro.insert(pomodoro2)
  const pomodoroOtherUser = { '_id': monk.id(), 'minutes': 25, 'type': 'pomodoro', 'startedAt': new Date('2019-06-04T19:35:27.255Z'), 'userId': monk.id() }
  await Pomodoro.insert(pomodoroOtherUser)

  const response = await fetch('http://localhost:3000/pomodoros?from=2019-06-03&to=2019-06-05', {
    method: 'GET',
    json: true,
    credentials: true,
    headers: {
      'Accept': 'application/json',
      cookie
    }
  })

  const json = await response.json()
  t.truthy(json)
  t.is(response.status, 200)
  t.is(json.length, 1)
  t.is(json[0].minutes, 25)
  t.true(new Date(json[0].startedAt) < new Date())
  t.is(json[0].type, 'pomodoro')
  t.truthy(json[0]._id)
  t.truthy(json[0].userId)
})

test('retrieve analysis aggregated by day', async t => {
  const pomodoro1 = { '_id': monk.id('5d24cca977850eb3a93b0f07'), 'minutes': 25, 'type': 'pomodoro', 'startedAt': new Date('2019-06-04T19:35:27.255Z'), 'userId': monk.id('5a9fe4e085d766000c002636') }
  const pomodoro2 = { '_id': monk.id('5d24ccaa77850eb3a93b0f08'), 'minutes': 25, 'type': 'pomodoro', 'startedAt': new Date('2019-06-05T11:29:23.233Z'), 'userId': monk.id('5a9fe4e085d766000c002636') }
  const pomodoro3 = { '_id': monk.id('5d24ccaa77850eb3a93b0f09'), 'minutes': 25, 'type': 'pomodoro', 'startedAt': new Date('2019-06-05T10:15:11.639Z'), 'userId': monk.id('5a9fe4e085d766000c002636') }
  await Pomodoro.insert(pomodoro1)
  await Pomodoro.insert(pomodoro2)
  await Pomodoro.insert(pomodoro3)

  const response = await fetch('http://localhost:3000/analysis', {
    method: 'GET',
    json: true,
    credentials: true,
    headers: {
      'Accept': 'application/json',
      cookie
    }
  })

  const json = await parseJSON(response)
  t.truthy(json)
  t.is(response.status, 200)
  console.log('json', JSON.stringify(json))
  t.is(json.length, 2)
  t.is(json[0].day, '2019-06-05')
  t.is(json[0].percentagePomodoros, 1)
  t.is(json[0].percentageTodos, 0)
  t.is(json[0].pomodoros.length, 2)
  t.is(json[0].todos.length, 0)
  t.is(json[1].day, '2019-06-04')
  t.is(json[1].percentagePomodoros, 0.5)
  t.is(json[1].percentageTodos, 0)
  t.is(json[1].pomodoros.length, 1)
  t.is(json[1].todos.length, 0)
})

test('create user todo', async t => {
  const todo = { completed: true, text: 'write some tests', id: 18, completedAt: new Date('2019-06-01T16:56:05.726Z') }
  const response = await fetch('http://localhost:3000/todos', {
    method: 'POST',
    json: true,
    body: JSON.stringify(todo),
    credentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      cookie
    }
  })

  const json = await response.json()
  t.is(response.status, 200)

  t.is(json.completed, true)
  t.is(json.text, 'write some tests')
  t.is(json.id, 18)
  t.deepEqual(new Date(json.completedAt), new Date('2019-06-01T16:56:05.726Z'))
  t.truthy(json._id)
  t.truthy(json.userId)

  const events = await Event.find()

  t.is(events.length, 2)
  const createTodoEvent = events.find(e => e.name === 'createTodo')
  t.is(createTodoEvent.user.username, 'christian-fei')
  t.truthy(createTodoEvent.createdAt)
  t.truthy(createTodoEvent.todo)
  t.true(createTodoEvent.todo.completed)
  t.is(createTodoEvent.todo.text, 'write some tests')
  t.is(createTodoEvent.todo.id, 18)
  t.is(createTodoEvent.todo.completedAt, '2019-06-01T16:56:05.726Z')
  t.truthy(new Date(createTodoEvent.todo.createdAt))

  const todoCreatedEvent = events.find(e => e.name === 'todoCreated')
  t.is(todoCreatedEvent.user.username, 'christian-fei')
  t.truthy(todoCreatedEvent.createdAt)
  t.truthy(todoCreatedEvent.todo)
  t.true(todoCreatedEvent.todo.completed)
  t.is(todoCreatedEvent.todo.text, 'write some tests')
  t.is(todoCreatedEvent.todo.id, 18)
  t.deepEqual(todoCreatedEvent.todo.completedAt, new Date('2019-06-01T16:56:05.726Z'))
  t.is(todoCreatedEvent.user.username, 'christian-fei')
  t.truthy(new Date(todoCreatedEvent.todo.createdAt))
})

test('retrieve user todos', async t => {
  const todo = { completed: true, text: 'write some tests', id: 18, completedAt: new Date('2019-06-01T16:56:05.726Z'), 'userId': monk.id('5a9fe4e085d766000c002636') }
  await Todo.insert(todo)
  const todoOtherUser = { completed: true, text: 'write some tests', id: 18, completedAt: new Date('2019-06-01T16:56:05.726Z'), 'userId': monk.id() }
  await Todo.insert(todoOtherUser)

  const response = await fetch('http://localhost:3000/todos', {
    method: 'GET',
    json: true,
    credentials: true,
    headers: {
      'Accept': 'application/json',
      cookie
    }
  })

  const json = await response.json()
  t.is(response.status, 200)
  t.is(json.length, 1)

  t.is(json[0].completed, true)
  t.is(json[0].text, 'write some tests')
  t.is(json[0].id, 18)
  t.deepEqual(new Date(json[0].completedAt), new Date('2019-06-01T16:56:05.726Z'))
  t.truthy(json[0]._id)
  t.truthy(json[0].userId)
})

test('retrieve user todolist', async t => {
  const todo1 = { completed: true, deleted: true, deletedAt: new Date('2019-06-01T16:56:05.726Z'), text: 'write some tests', id: 18, completedAt: new Date('2019-06-01T16:56:05.726Z'), 'userId': monk.id('5a9fe4e085d766000c002636') }
  await Todo.insert(todo1)
  const todo2 = { completed: true, text: 'write some tests', id: 18, completedAt: new Date('2019-06-01T16:56:05.726Z'), 'userId': monk.id('5a9fe4e085d766000c002636') }
  await Todo.insert(todo2)
  const todoOtherUser = { completed: true, text: 'write some tests', id: 18, completedAt: new Date('2019-06-01T16:56:05.726Z'), 'userId': monk.id() }
  await Todo.insert(todoOtherUser)

  const response = await fetch('http://localhost:3000/todos/list', {
    method: 'GET',
    json: true,
    credentials: true,
    headers: {
      'Accept': 'application/json',
      cookie
    }
  })

  t.is(response.status, 200)
  const json = await response.json()
  t.is(json.length, 1)

  t.is(json[0].completed, true)
  t.is(json[0].text, 'write some tests')
  t.is(json[0].id, 18)
  t.deepEqual(new Date(json[0].completedAt), new Date('2019-06-01T16:56:05.726Z'))
  t.truthy(json[0]._id)
  t.truthy(json[0].userId)
})

test('retrieve user todos by time range', async t => {
  const todo1 = { completed: true, text: 'write some tests', id: 18, createdAt: new Date('2019-06-01T16:56:05.726Z'), 'userId': monk.id('5a9fe4e085d766000c002636') }
  await Todo.insert(todo1)
  const todo2 = { completed: true, text: 'write some more tests', id: 18, createdAt: new Date('2019-06-04T16:56:05.726Z'), 'userId': monk.id('5a9fe4e085d766000c002636') }
  await Todo.insert(todo2)
  const todoOtherUser = { completed: true, text: 'write some tests', id: 18, createdAt: new Date('2019-06-01T16:56:05.726Z'), 'userId': monk.id() }
  await Todo.insert(todoOtherUser)

  const response = await fetch('http://localhost:3000/todos?from=2019-06-03&to=2019-06-05', {
    method: 'GET',
    json: true,
    credentials: true,
    headers: {
      'Accept': 'application/json',
      cookie
    }
  })

  const json = await response.json()
  t.truthy(json)
  t.is(response.status, 200)
  t.is(json.length, 1)
  t.true(new Date(json[0].createdAt) < new Date())
})
