defmodule Api.Router do
  use Plug.Router

  alias Api.Authorizer.Plug, as: Authorizer

  plug Plug.Logger
  if Mix.env == :dev, do: use Plug.Debugger

  plug Authorizer
  plug Plug.Parsers, parsers: [:json],
                     json_decoder: Poison
  plug :match
  plug :dispatch

  forward "/api/pomodoros", to: Api.Router.Pomodoros
  forward "/api/todos", to: Api.Router.Todos

  match _ do
    send_resp(conn, 404, "404")
  end
end
