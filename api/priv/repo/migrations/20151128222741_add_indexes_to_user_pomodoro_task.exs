defmodule Api.Repo.Migrations.AddIndexesToUserPomodoroTask do
  use Ecto.Migration

  def change do
    create unique_index(:user_pomodoro_task, [:user_id, :pomodoro_task_id])
  end
end
