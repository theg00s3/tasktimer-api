defmodule Api.Repo.Migrations.AddOrderFieldToPomodoroTask do
  use Ecto.Migration

  def change do
    alter table :pomodoro_task do
      add :order,   :integer
    end
  end
end
