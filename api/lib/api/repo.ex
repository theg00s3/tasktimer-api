defmodule Api.Repo do
  use Ecto.Repo, otp_app: :api  
  import Ecto.Query
  alias Api.Repo
  alias Api.Models.Pomodoro
  alias Api.Models.Todo
  alias Api.Models.PomodoroTodo
  alias Api.Models.UserPomodoro
  alias Api.Models.UserTodo

  # pomodoro_todos
  def associate_todo_to_pomodoro(user_id, todo_id, pomodoro_id) do
    pomodoro_todo = PomodoroTodo.changeset(%PomodoroTodo{}, %{pomodoro_id: pomodoro_id, todo_id: todo_id})
    insert pomodoro_todo
  end

  def deassociate_todo_to_pomodoro(user_id, todo_id, pomodoro_id) do
    association = Repo.one(from pt in PomodoroTodo, where: pt.todo_id == ^todo_id and pt.pomodoro_id == ^pomodoro_id)
    delete association
  end

  # pomodoros
  def create_pomodoro_for(user_id, pomodoro) do
    case insert pomodoro do
      {:ok, pomodoro} ->
        insert %UserPomodoro{user_id: user_id, pomodoro_id: pomodoro.id}
        pomodoro = pomodoro
          |> Repo.preload(:todos)
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
    Pomodoro.Query.daily(day)
    |> UserPomodoro.for_user(user_id)
    |> all
    |> Repo.preload(:todos)
  end
  def pomodoros_for(user_id) do
    Pomodoro.Query.all
    |> UserPomodoro.for_user(user_id)
    |> all
    |> Repo.preload(:todos)
  end

  def pomodoro_for(user_id, pomodoro_id) do
    pomodoro = Pomodoro.Query.get(pomodoro_id)
    |> UserPomodoro.for_user(user_id)
    |> one
    if pomodoro do
      pomodoro |> Repo.preload(:todos)
    else
      pomodoro
    end
  end

  def unfinished_pomodoro_for(user_id) do
    pomodoro = Pomodoro.Query.unfinished
    |> UserPomodoro.for_user(user_id)
    |> one
    if pomodoro do
      pomodoro |> Repo.preload(:todos)
    else
      pomodoro
    end
  end

  def update_pomodoro_for(user_id, pomodoro) do
    update pomodoro
  end

  def obsolete_pomodori do
    Pomodoro.Query.obsolete
    |> all
    |> Repo.preload(:todos)
  end





  # todos
  def todos_for(user_id) do
    Todo.Query.in_progress
    |> UserTodo.for_user(user_id)
    |> all
  end

  def daily_completed_todos_for(user_id, day) do
    Todo.Query.daily(day)
    |> Todo.Query.completed
    |> UserTodo.for_user(user_id)
    |> all
  end

  def todo_for(user_id, todo_id) do
    Todo.Query.get(todo_id)
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
