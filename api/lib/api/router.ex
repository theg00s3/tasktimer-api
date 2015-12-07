defmodule Api.Router do
  use Plug.Router

  alias Api.Authorizer.Plug, as: Authorizer
  alias Api.Repo
  alias Api.Models.Pomodoro
  alias Api.Models.PomodoroTask

  plug Plug.Logger
  if Mix.env == :dev, do: use Plug.Debugger

  plug Authorizer
  plug Plug.Parsers, parsers: [:json],
                     json_decoder: Poison
  plug :match
  plug :dispatch

  get "/api/pomodoros" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    pomodoros = Repo.pomodoros_for(user_id)
    IO.inspect pomodoros
    send_resp(conn, 200, Poison.encode!(pomodoros))
  end

  post "/api/pomodoros" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    changeset = Pomodoro.changeset(%Pomodoro{}, conn.params)
    {:ok, pomodoro} = Repo.create_pomodoro_for(user_id, changeset)
    send_resp(conn, 201, Poison.encode!(pomodoro))
  end



  get "/api/tasks" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    tasks = Repo.tasks_for(user_id)
    IO.inspect tasks
    send_resp(conn, 200, Poison.encode!(tasks))
  end

  get "/api/tasks/:task_id" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    task = Repo.task_for(user_id, task_id)
    IO.inspect task
    send_resp(conn, 200, Poison.encode!(task))
  end

  post "/api/tasks" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    IO.inspect conn.params
    changeset = PomodoroTask.changeset(%PomodoroTask{}, conn.params)
    IO.inspect changeset
    {:ok, pomodoro_task} = Repo.create_pomodoro_task_for(user_id, changeset)
    send_resp(conn, 201, Poison.encode!(pomodoro_task))
  end

  put "/api/tasks/:task_id" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    old_task = Repo.task_for(user_id, task_id)
    updated_task = PomodoroTask.changeset(old_task, conn.params)
    {:ok, pomodoro_task} = Repo.update_pomodoro_task_for(user_id, updated_task)
    send_resp(conn, 201, Poison.encode!(pomodoro_task))
  end

  match _ do
    send_resp(conn, 404, "404")
  end
end
