api for pomodoro.cc

## requirements

- now account configured
- node 10+
- mongo

## installation

```
npm i
```

## test

configure MONGO_URL in `.env`

`MONGO_URL=mongodb://localhost:27017/test`

```
npm start
npm t
```

## migrations

configure with `npm run migrate-mongo init`