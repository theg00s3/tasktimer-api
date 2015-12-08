defmodule Api.Router.Tasks do
  use Plug.Router

  alias Api.Repo
  alias Api.Models.Pomodoro
  alias Api.Models.PomodoroTask

  plug :match
  plug :dispatch

  get "/" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    tasks = Repo.tasks_for(user_id)
    IO.inspect tasks
    send_resp(conn, 200, Poison.encode!(tasks))
  end

  get "/:task_id" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    task = Repo.task_for(user_id, task_id)
    IO.inspect task
    send_resp(conn, 200, Poison.encode!(task))
  end

  post "/" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    IO.inspect conn.params
    changeset = PomodoroTask.changeset(%PomodoroTask{}, conn.params)
    IO.inspect changeset
    {:ok, pomodoro_task} = Repo.create_pomodoro_task_for(user_id, changeset)
    send_resp(conn, 201, Poison.encode!(pomodoro_task))
  end

  put "/:task_id" do
    user = conn.assigns[:user]
    user_id = Dict.get(user, "id")
    old_task = Repo.task_for(user_id, task_id)
    updated_task = PomodoroTask.changeset(old_task, conn.params)
    {:ok, pomodoro_task} = Repo.update_pomodoro_task_for(user_id, updated_task)
    send_resp(conn, 201, Poison.encode!(pomodoro_task))
  end

end
