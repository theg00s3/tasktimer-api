const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

module.exports = [
  morgan(':status\t :method\t :response-time ms\t :date[clf]\t :url\t\t'),
  cors({
    origin: true, // ['https://pomodoro.cc', 'http://localhost:1234', 'http://localhost:3000'], // true, // ['https://pomodoro.cc', 'http://beta.pomodoro.cc', 'https://beta.pomodoro.cc', 'https://app.pomodoro.cc', 'https://dev.pomodoro.cc', 'http://dev.pomodoro.cc', 'http://dev.pomodoro.cc:9000'],
    methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['x-now-id', 'x-now-trace', 'x-powered-by', 'Origin', 'Accept', 'Content-Type', 'Set-Cookie'],
    credentials: true
  }),
  cookieParser(),
  bodyParser.json({}),
  bodyParser.urlencoded({ extended: true })
]
