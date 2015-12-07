defmodule Api.Repo.Migrations.AddIndexesToUserPomodoro do
  use Ecto.Migration

  def change do
    create unique_index(:user_pomodoro, [:user_id, :pomodoro_id])
  end
end
