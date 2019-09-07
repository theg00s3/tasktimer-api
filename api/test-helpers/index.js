const fetch = require('node-fetch')

module.exports = {
  get,
  post,
  parseJSON
}

async function get (url) {
  return fetch('http://localhost:3000' + url, {
    method: 'GET',
    json: true,
    credentials: true,
    headers: {
      Accept: 'application/json',
      cookie: global.cookie
    }
  })
}

async function post (url, body) {
  return fetch('http://localhost:3000' + url, {
    method: 'POST',
    json: true,
    body: JSON.stringify(body),
    credentials: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      cookie: global.cookie
    }
  })
}

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
