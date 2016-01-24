defmodule Api.Repo.Migrations.SetFinishedForNullPomodorosToFalse do
  use Ecto.Migration

  def change do
    execute("UPDATE pomodoro SET finished = true WHERE finished IS null")
  end
end
