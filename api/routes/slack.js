var router = require('express').Router()
  , slack = require('../modules/slack')
  , url = require('url')

router.post('/public', function(req,res){
  console.log( '-- slack: post /public', req.body )
  res.json(slack.responseFor(req.body))
})

module.exports = router
