defmodule Api.Repo.Migrations.AddFinishedFieldToPomodoro do
  use Ecto.Migration

  def change do
    alter table :pomodoro do
      add :finished,   :boolean
    end
  end
end
