defmodule Api.Repo.Migrations.RenameTodoToTodo do
  use Ecto.Migration

  def change do
    rename table(:pomodoro_task), to: table(:todos)
    rename table(:user_pomodoro_task), to: table(:user_todos)
  end
end
