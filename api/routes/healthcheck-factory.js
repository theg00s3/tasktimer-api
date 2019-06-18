const { Router } = require('express')
const router = new Router()

module.exports = router

router.get('/', (req, res) => {
  res.writeHead(200)
  res.end()
})
