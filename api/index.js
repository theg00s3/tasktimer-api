var config = require('config')
var app = require('express')()
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , morgan = require('morgan')

app.listen(config.get('server.port'))

require('./passport.init')(app)

app.use(morgan(':status\t :method\t :response-time ms\t :date[clf]\t :url\t\t'))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', require('./routes'))

module.exports = app
