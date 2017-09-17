defmodule Api.Models.PomodoroTodo do
  use Ecto.Schema
  import Ecto
  import Ecto.Query
  alias Api.Models.PomodoroTodo

  @required_fields ~w(pomodoro_id todo_id)
  @optional_fields ~w()

  schema "pomodoro_todo" do
    belongs_to :pomodoro, Api.Models.Pomodoro
    belongs_to :todo, Api.Models.Todo
  end

  # changeset
  def changeset(model, params \\ :empty) do
    Ecto.Changeset.cast(model, params, @required_fields)
    |> Ecto.Model.foreign_key_constraint(:pomodoro_id)
    |> Ecto.Model.foreign_key_constraint(:todo_id)
  end
end
