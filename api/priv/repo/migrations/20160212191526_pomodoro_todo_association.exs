defmodule Api.Repo.Migrations.PomodoroTodoAssociation do
  use Ecto.Migration

  def change do
    create table :pomodoro_todo do
      add :pomodoro_id,      :integer, required: true
      add :todo_id,          :integer, required: true
    end
    create unique_index(:pomodoro_todo, [:pomodoro_id, :todo_id])
  end
end
