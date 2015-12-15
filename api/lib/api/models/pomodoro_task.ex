defmodule Api.Models.PomodoroTask do
  use Ecto.Model
  import Ecto.Query
  alias Api.Models.PomodoroTask

  @required_fields ~w(text)
  @optional_fields ~w(completed deleted)

  schema "pomodoro_task" do
    field :text,         :string
    field :completed,    :boolean, default: false
    field :deleted,      :boolean, default: false
    timestamps
  end

  # query api
  def all do
    from pt in PomodoroTask
  end
  def in_progress do
    from pt in all,
      where: pt.deleted == false,
      order_by: pt.completed
  end
  def get(pomodoro_task_id) do
    from pt in all,
      where: pt.id == ^pomodoro_task_id
  end

  # changeset
  def changeset(model, params \\ :empty) do
    cast(model, params, @required_fields, @optional_fields)
  end
end
