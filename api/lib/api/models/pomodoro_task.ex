defmodule Api.Models.PomodoroTask do
  use Ecto.Model
  import Ecto.Query
  alias Api.Models.PomodoroTask

  @required_fields ~w(text)
  @optional_fields ~w(completed completed_at deleted)

  schema "pomodoro_task" do
    field :text,         :string
    field :completed,    :boolean, default: false
    field :completed_at, Ecto.DateTime
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
  def changeset(model, params) do
    if Map.has_key?(params, :completed) do
      if params.completed do
        params = Map.put params, :completed_at, Ecto.DateTime.local
      else
        params = Map.delete params, :completed_at
      end
    end
    cast(model, params, @required_fields, @optional_fields)
  end
end
