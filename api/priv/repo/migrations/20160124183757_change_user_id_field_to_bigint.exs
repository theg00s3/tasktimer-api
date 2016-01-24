defmodule Api.Repo.Migrations.ChangeUserIdFieldToBigint do
  use Ecto.Migration

  def change do
    alter table :user_pomodoro do
      modify :user_id, :string
    end
    alter table :user_pomodoro_task do
      modify :user_id, :string
    end
  end
end
