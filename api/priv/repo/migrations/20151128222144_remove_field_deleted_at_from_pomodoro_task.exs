defmodule Api.Repo.Migrations.RemoveFieldDeletedAtFromPomodoroTask do
  use Ecto.Migration

  def change do
    alter table :pomodoro_task do
      remove :deleted_at
    end
  end
end
