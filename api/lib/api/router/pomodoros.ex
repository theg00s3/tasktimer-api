defmodule Api.Router.Pomodoros do
  use Plug.Router

  alias Api.Repo
  alias Api.Models.Pomodoro
  alias Api.Models.PomodoroTask

  plug :match
  plug :dispatch

  get "/" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    conn = fetch_query_params(conn)
    query_params = conn.query_params
    pomodoros = nil
    if Map.has_key?(query_params, "day") do
      pomodoros = Repo.daily_pomodoros_for(user_id, Map.get(query_params, "day"))
    else
      pomodoros = Repo.pomodoros_for(user_id)
    end
    send_resp(conn, 200, Poison.encode!(pomodoros))
  end

  post "/" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    changeset = Pomodoro.changeset(%Pomodoro{}, conn.params)
    {:ok, pomodoro} = Repo.create_pomodoro_for(user_id, changeset)
    send_resp(conn, 201, Poison.encode!(pomodoro))
  end
end
