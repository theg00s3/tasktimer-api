defmodule Api.Repo.Migrations.AddPomodoroTask do
  use Ecto.Migration

  def change do
    create table :pomodoro_task do
      add :text,         :string, size: 500
      add :completed,    :boolean
      add :deleted,      :boolean
      add :deleted_at,   :timestamp
      timestamps
    end
  end
end
