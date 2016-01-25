defmodule Api.Repo do
  use Ecto.Repo, otp_app: :api
  import Ecto.Query
  alias Api.Repo
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

  def complete_obsolete_pomodori do
    Repo.obsolete_pomodori
    |> Enum.each(&Repo.complete_pomodoro(&1))
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





  # todos
  def todos_for(user_id) do
    Todo.in_progress
    |> UserTodo.for_user(user_id)
    |> all
  end

  def daily_completed_todos_for(user_id, day) do
    Todo.daily(day)
    |> Todo.completed
    |> UserTodo.for_user(user_id)
    |> all
  end

  def todo_for(user_id, todo_id) do
    Todo.get(todo_id)
    |> UserTodo.for_user(user_id)
    |> one
  end

  def create_todo_for(user_id, todo) do
    case insert todo do
      {:ok, todo} ->
        insert %UserTodo{user_id: user_id, todo_id: todo.id}
        {:ok, todo}
      {:error, changeset}  ->
        {:error, changeset}
    end
  end

  def update_todo_for(user_id, todo) do
    update todo
  end

end
