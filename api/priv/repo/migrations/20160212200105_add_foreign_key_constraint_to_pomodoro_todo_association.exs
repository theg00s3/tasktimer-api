defmodule Api.Repo.Migrations.AddForeignKeyConstraintToPomodoroTodoAssociation do
  use Ecto.Migration

  def change do
    execute "ALTER TABLE pomodoro_todo ADD FOREIGN KEY (pomodoro_id) REFERENCES pomodoro;"
    execute "ALTER TABLE pomodoro_todo ADD FOREIGN KEY (todo_id) REFERENCES todos;"
  end
end
