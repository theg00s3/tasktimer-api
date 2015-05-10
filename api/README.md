pomodoro-auth
=============

[![Circle CI](https://circleci.com/gh/christian-fei/pomodoro-api.svg?style=shield)](https://circleci.com/gh/christian-fei/pomodoro-api)

[![pomodoro docker](http://dockeri.co/image/christianfei/pomodoro-api)](https://hub.docker.com/u/christianfei/pomodoro-api/)



Authentication for [pomodoro.cc](https://pomodoro.cc)

## Setup

```
npm install
```

During development:

```
node[-dev] index.js
```

Server runs on port 9001, or port specified in environment variable POMODORO_AUTH_PORT.


----

Move `credentials/index.template.js` to `credentials/index.js` and fill in the auth information.


## test

Run the tests with a running MongoDB instance with

```
NODE_ENV=test npm test
``
