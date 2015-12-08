Install the dependencies with

```
mix deps.get
```

---


# Development inside vagrant

I suggest to develop and test inside vagrant and docker.
To do so, simply run (inside vagrant)

```
/pomodoro.cc/opt/docker.restart DEV
```

---

Run the tests (inside vagrant) with

```
/pomodoro.cc/api/opt/test
```


# Development on own host machine

The **MIX_ENV** in this case is `dev`, so be sure to set it.

The api connects to your local Postgres instance.

Initialize the db by running `mix do ecto.create, ecto.migrate`

If needed, configure `config/dev.exs` accordingly.

The Authorizer used in this environment is a fake one (fake_authorizer.ex).
You can authenticate your request simply by providing the Header "Cookie: authorized" during your tests.

e.g with curl:

```
curl localhost:4000/api/pomodoros -H "Cookie: authorized"
```
