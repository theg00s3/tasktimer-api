defmodule Api.Repo.Migrations.AddUserPomodoroTask do
  use Ecto.Migration

  def change do
    create table :user_pomodoro_task do
      add :user_id,          :integer
      add :pomodoro_task_id, references(:pomodoro_task)
    end
  end
end
