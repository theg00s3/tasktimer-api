defmodule Api.Repo do
  use Ecto.Repo, otp_app: :api
  import Ecto.Query
  alias Api.Models.Pomodoro
  alias Api.Models.Todo
  alias Api.Models.UserPomodoro
  alias Api.Models.UserTodo

  # pomodoros
  def create_pomodoro_for(user_id, pomodoro) do
    case insert pomodoro do
      {:ok, pomodoro} ->
        insert %UserPomodoro{user_id: user_id, pomodoro_id: pomodoro.id}
        {:ok, pomodoro}
      {:error, changeset}  ->
        {:error, changeset}
    end
  end

  def complete_pomodoro(pomodoro) do
    changeset = Pomodoro.changeset(pomodoro, %{finished: true})
    update changeset
  end

  def daily_pomodoros_for(user_id, day) do
    Pomodoro.daily(day)
    |> UserPomodoro.for_user(user_id)
    |> all
  end
  def pomodoros_for(user_id) do
    Pomodoro.all
    |> UserPomodoro.for_user(user_id)
    |> all
  end

  def pomodoro_for(user_id, pomodoro_id) do
    Pomodoro.get(pomodoro_id)
    |> UserPomodoro.for_user(user_id)
    |> one
  end

  def unfinished_pomodoro_for(user_id) do
    Pomodoro.unfinished
    |> UserPomodoro.for_user(user_id)
    |> one
  end

  def update_pomodoro_for(user_id, pomodoro) do
    update pomodoro
  end

  def obsolete_pomodori do
    Pomodoro.obsolete
    |> all
  end





  # tasks
  def tasks_for(user_id) do
    Todo.in_progress
    |> UserTodo.for_user(user_id)
    |> all
  end

  def daily_completed_tasks_for(user_id, day) do
    Todo.daily(day)
    |> Todo.completed
    |> UserTodo.for_user(user_id)
    |> all
  end

  def task_for(user_id, task_id) do
    Todo.get(task_id)
    |> UserTodo.for_user(user_id)
    |> one
  end

  def create_task_for(user_id, task) do
    case insert task do
      {:ok, todos} ->
        insert %UserTodo{user_id: user_id, todo_id: todos.id}
        {:ok, todos}
      {:error, changeset}  ->
        {:error, changeset}
    end
  end

  def update_task_for(user_id, task) do
    update task
  end

end
