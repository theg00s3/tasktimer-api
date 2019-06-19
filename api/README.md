api for pomodoro.cc

## requirements

- now account configured
- node 10+
- mongo

## test

configure MONGO_URL in `.env`

`MONGO_URL=mongodb://localhost:27017/test`

```
env NODE_ENV=test node server.js # alternatively, with `now dev` running `npm start`, but it's quite slow
npm t
```

## migrations

configure with `npm run migrate-mongo init`