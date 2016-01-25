defmodule Api.Repo.Migrations.RenamePomodoroTaskFieldsToTodo do
  use Ecto.Migration

  def change do
    rename table(:user_todos), :pomodoro_task_id, to: :todo_id
  end
end
