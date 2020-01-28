const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

module.exports = [
  morgan(':status\t :method\t :response-time ms\t :date[clf]\t :url\t\t'),
  cors({
    origin: true,
    methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['x-now-id', 'x-now-trace', 'x-powered-by', 'Origin', 'Accept', 'Content-Type', 'Set-Cookie'],
    credentials: true
  }),
  cookieParser(),
  bodyParser.json({}),
  bodyParser.urlencoded({ extended: true })
]
