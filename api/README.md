`npm install`.

You can run the tests with: (inside vagrant)

```
/pomodoro.cc/api/opt/test
```

In `DEV` mode (when `docker.restart|run` is started with a `DEV` parameter), an authentication backdoor
is activated for e2e testing. You can login in by visiting [https://pomodoro.dev/auth/fake](https://pomodoro.dev/auth/fake).
