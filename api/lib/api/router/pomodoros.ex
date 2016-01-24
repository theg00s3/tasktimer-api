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
    user_id = Integer.to_string(user_id)
    conn = fetch_query_params(conn)
    query_params = conn.query_params
    response = case query_params do
      %{"day" => day}       -> Repo.daily_pomodoros_for(user_id, day)
      %{"unfinished" => _}  -> Repo.unfinished_pomodoro_for(user_id)
      _                     -> Repo.pomodoros_for(user_id)
    end
    send_resp(conn, 200, Poison.encode!(response))
  end

  post "/" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    user_id = Integer.to_string(user_id)
    changeset = Pomodoro.changeset(%Pomodoro{}, conn.params)
    {:ok, pomodoro} = Repo.create_pomodoro_for(user_id, changeset)
    send_resp(conn, 201, Poison.encode!(pomodoro))
  end

  put "/:pomodoro_id" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    user_id = Integer.to_string(user_id)
    old_pomodoro = Repo.pomodoro_for(user_id, pomodoro_id)
    updated_pomodoro = Pomodoro.changeset(old_pomodoro, conn.params)
    {:ok, pomodoro} = Repo.update_pomodoro_for(user_id, updated_pomodoro)
    send_resp(conn, 200, Poison.encode!(pomodoro))
  end
end
