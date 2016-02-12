defmodule Api.Repo.Migrations.PomodoroTodoAssociation do
  use Ecto.Migration

  def change do
    create table :pomodoro_todo do
      add :pomodoro_id,      :integer, required: true
      add :user_id,          :integer, required: true
      timestamps
    end
    create unique_index(:pomodoro_todo, [:pomodoro_id, :user_id])
  end
end
