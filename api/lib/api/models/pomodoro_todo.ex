defmodule Api.Models.PomodoroTodo do
  use Ecto.Model
  import Ecto.Query
  alias Api.Models.PomodoroTodo

  @required_fields ~w(pomodoro_id todo_id)
  @optional_fields ~w()

  schema "pomodoro_todo" do
    field :pomodoro_id,     :integer
    field :todo_id,         :integer
  end

  # changeset
  def changeset(model, params \\ :empty) do
    cast(model, params, @required_fields, @optional_fields)
  end
end
