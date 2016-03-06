use Mix.Config

config :api, Api.Repo,
  adapter: Ecto.Adapters.Postgres,
  database: "pomodoro_cc",
  username: "postgres",
  password: "postgres",
  hostname: "pomodoro-api-db"

config :api,
  http_port: 4000,
  authorizer_url: "http://pomodoro-auth:6000/auth/info",
  authorizer:     Api.Authorizer,
  pagination:     10

config :logger, level: :info

import_config "#{Mix.env}.exs"
