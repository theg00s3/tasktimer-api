defmodule Api.Models.Todo do
  use Ecto.Model
  import Ecto.Query
  alias Api.Models.Todo

  @required_fields ~w(text)
  @optional_fields ~w(completed completed_at deleted order)
  @one_day {60*60*24/1000000, 0, 0}

  schema "todos" do
    field :text,         :string
    field :completed,    :boolean, default: false
    field :completed_at, Ecto.DateTime
    field :deleted,      :boolean, default: false
    field :order,        :integer
    timestamps
  end

  # query api
  def all do
    from pt in Todo
  end

  def in_progress(query) do
    from pt in query,
      where: pt.deleted == false,
      order_by: pt.updated_at
  end
  def in_progress() do
    in_progress(all())
  end

  def completed(query) do
    from pt in query,
      where: pt.completed == true,
      order_by: pt.completed_at
  end
  def completed do
    completed(all())
  end

  def daily(query, day) do
    {beginning_day, ending_day} = get_date_range(day)
    from pt in query,
      where: pt.completed_at >= ^beginning_day,
      where: pt.completed_at < ^ending_day
  end
  def daily(day) do
    daily(all(), day)
  end

  def get(query, todo_id) do
    from pt in query,
      where: pt.id == ^todo_id
  end
  def get(todo_id) do
    get(all(), todo_id)
  end

  defp get_date_range(day) do
    beginning_day = Timex.DateFormat.parse!(day, "{YYYY}/{0M}/{0D}")
    ending_day = Timex.Date.add(beginning_day, @one_day)
    beginning_day = beginning_day
      |> Timex.Date.Convert.to_erlang_datetime
      |> Ecto.DateTime.from_erl
    ending_day = ending_day
      |> Timex.Date.Convert.to_erlang_datetime
      |> Ecto.DateTime.from_erl
    {beginning_day, ending_day}
  end


  # changeset
  def changeset(model, params) do
    if Map.has_key?(params, "completed") do
      if Map.get(params, "completed") do
        params = Map.put params, "completed_at", Ecto.DateTime.utc
      else
        params = Map.delete params, "completed_at"
      end
    end
    cast(model, params, @required_fields, @optional_fields)
  end
end
