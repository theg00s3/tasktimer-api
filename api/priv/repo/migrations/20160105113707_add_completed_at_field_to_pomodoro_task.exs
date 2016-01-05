defmodule Api.Repo.Migrations.AddCompletedAtFieldToPomodoroTask do
  use Ecto.Migration

  def change do
    alter table :pomodoro_task do
      add :completed_at,   :datetime
    end
  end
end
