const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const app = require('express')()

module.exports = [
  app.use(morgan(':status\t :method\t :response-time ms\t :date[clf]\t :url\t\t')),
  app.use(cors({
    origin: ['https://pomodoro.cc', 'http://beta.pomodoro.cc', 'https://beta.pomodoro.cc', 'https://app.pomodoro.cc', 'https://dev.pomodoro.cc', 'http://dev.pomodoro.cc', 'http://dev.pomodoro.cc:9000'],
    methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['cookie', 'with_credentials'],
    credentials: true
  })),
  app.use(cookieParser()),
  app.use(bodyParser.json()),
  app.use(bodyParser.urlencoded({ extended: true }))
]
