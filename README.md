# API for TaskTimer.Tk

## Boost your productivity
### Manage your time more effectively

[Task Timer](https://tasktimer.tk) is an online time tracking tool to plan and review the tasks for the day.

It takes advantage of the guidelines described in the [Pomodoro Technique](http://pomodorotechnique.com) to work more effectively with frequent, mind-refreshing breaks.

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
