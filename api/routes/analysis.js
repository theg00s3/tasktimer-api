const analysis = require('../app')
const analysisFactory = require('./analysis-factory')

analysis.use(analysisFactory)

module.exports = analysis
