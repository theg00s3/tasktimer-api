const path = require('path')

const production = process.env.NODE_ENV === 'production'
const endFileName = production ? '.env.production' : '.env.development'
const pathToEnvFile = path.resolve(__dirname, endFileName)
require('dotenv').config({ path: pathToEnvFile })
