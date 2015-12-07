defmodule Api.Repo.Migrations.AddPomodoro do
  use Ecto.Migration

  def change do
    create table :pomodoro do
      add :type,         :string, required: true
      add :minutes,      :integer, required: true
      add :started_at,   :datetime, required: true
      add :cancelled_at, :datetime
      timestamps
    end
  end
end
