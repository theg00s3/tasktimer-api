defmodule Api.Router.Tasks do
  use Plug.Router

  alias Api.Repo
  alias Api.Models.PomodoroTask

  plug :match
  plug :dispatch

  get "/" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    conn = fetch_query_params(conn)
    query = conn.query_params
    tasks = case query do
      %{"completed" => _, "day" => day } -> Repo.daily_completed_tasks_for(user_id, day)
      _ -> Repo.tasks_for(user_id)
    end
    send_resp(conn, 200, Poison.encode!(tasks))
  end

  get "/:task_id" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    task = Repo.task_for(user_id, task_id)
    send_resp(conn, 200, Poison.encode!(task))
  end

  post "/" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    changeset = PomodoroTask.changeset(%PomodoroTask{}, conn.params)
    {:ok, pomodoro_task} = Repo.create_task_for(user_id, changeset)
    send_resp(conn, 201, Poison.encode!(pomodoro_task))
  end

  put "/:task_id" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    old_task = Repo.task_for(user_id, task_id)
    updated_task = PomodoroTask.changeset(old_task, conn.params)
    {:ok, pomodoro_task} = Repo.update_task_for(user_id, updated_task)
    send_resp(conn, 201, Poison.encode!(pomodoro_task))
  end

end
