use Mix.Config

config :api, Api.Repo,
  adapter: Ecto.Adapters.Postgres,
  database: "pomodoro_cc",
  username: "postgres",
  password: "postgres",
  hostname: "localhost"


config :api,
  http_port: 4000,
  authorizer:     Api.FakeAuthorizer
