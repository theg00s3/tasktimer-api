defmodule Api.Repo.Migrations.SetFinishedForOldPomodorosToFalse do
  use Ecto.Migration

  def change do
    execute("UPDATE pomodoro SET finished = true WHERE finished = null")
  end
end
