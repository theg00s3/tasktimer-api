defmodule Api.Repo.Migrations.AddUserPomodoro do
  use Ecto.Migration

  def change do
    create table :user_pomodoro do
      add :user_id,          :integer
      add :pomodoro_id, references(:pomodoro)
    end
  end
end
