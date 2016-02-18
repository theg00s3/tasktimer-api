defmodule Api.Router.Pomodoros do
  use Plug.Router

  alias Api.Repo
  alias Api.Models.Pomodoro

  plug :match
  plug :dispatch

  get "/" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
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
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    changeset = Pomodoro.changeset(%Pomodoro{}, conn.params)
    {:ok, pomodoro} = Repo.create_pomodoro_for(user_id, changeset)
    conn
      |> put_resp_header("location", "/api/pomodoros/#{pomodoro.id}")
      |> send_resp(201, Poison.encode!(pomodoro))
  end

  put "/:pomodoro_id" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    old_pomodoro = Repo.pomodoro_for(user_id, pomodoro_id)
    updated_pomodoro = Pomodoro.changeset(old_pomodoro, conn.params)
    {:ok, pomodoro} = Repo.update_pomodoro_for(user_id, updated_pomodoro)
    send_resp(conn, 200, Poison.encode!(pomodoro))
  end

  post "/:pomodoro_id/todos/:todo_id/associate" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    status_code = case Repo.associate_todo_to_pomodoro(user_id, todo_id, pomodoro_id) do
      {:ok, _} -> 200
      {:error, _} -> 400
    end
    send_resp(conn, status_code, "")
  end

end
