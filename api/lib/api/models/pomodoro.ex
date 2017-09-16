defmodule Api.Models.Pomodoro do
  use Ecto.Repo
  use Ecto.Schema
  import Ecto
  import Ecto.Query
  alias Api.Models.Pomodoro
  alias Api.Models.PomodoroTodo

  @required_fields ~w(type minutes started_at)
  @optional_fields ~w(cancelled_at finished)

  schema "pomodoro" do
    field :type,         :string
    field :minutes,      :integer
    field :finished,     :boolean, default: false
    field :started_at,   Ecto.DateTime
    field :cancelled_at, Ecto.DateTime
    has_many :pomodoro_todo, Api.Models.PomodoroTodo
    has_many :todos, through: [:pomodoro_todo, :todo]
    timestamps
  end




  # changeset
  def changeset(model, params \\ :empty) do
    cast(model, params, @required_fields, @optional_fields)
    |> validate_inclusion(:minutes, [5,15,25])
    |> validate_type
    |> validate_minutes
    |> validate_cancelled_at
  end

  defp validate_type(changeset) do
    validate_change(changeset, :type, fn (_, type) ->
      case type do
        "break" -> []
        "pomodoro" -> []
        _ -> [:type, "invalid type"]
      end
    end)
  end

  defp validate_minutes(changeset) do
    validate_change(changeset, :minutes, fn (_, minutes) ->
      type = Ecto.Changeset.get_field(changeset, :type, nil)
      case type do
        nil -> [:minutes, "minutes cannot be validates without type"]
        "break" ->
          if Enum.member?([5,15], minutes), do: [], else: [:minutes, "invalid minutes for type 'break'"]
        "pomodoro" ->
          if minutes == 25, do: [], else: [:minutes, "invalid minutes for type 'pomodoro'"]
        _ -> [:minutes, "invalid type"]
      end
    end)
  end

  defp validate_cancelled_at(changeset) do
    validate_change(changeset, :cancelled_at, fn (_, cancelled_at) ->
      minutes = Ecto.Changeset.get_field(changeset, :minutes, nil)
      started_at = Ecto.Changeset.get_field(changeset, :started_at, nil)
      cancelled_at = Ecto.Changeset.get_field(changeset, :cancelled_at, nil)
      case cancelled_at do
        nil -> []
        _   ->
          if valid_cancelled_at?(started_at, cancelled_at, minutes) do
            []
          else
            [:cancelled_at, "cancelled_at must be a timestamp after started_at"]
          end
      end
    end)
  end

  defp valid_cancelled_at?(started_at, cancelled_at, minutes) do
    if :lt == Ecto.DateTime.compare(started_at, cancelled_at) do
      started_at_tt = Timex.Date.from(Ecto.DateTime.to_erl(started_at))
      cancelled_at_tt = Timex.Date.from(Ecto.DateTime.to_erl(cancelled_at))
      Timex.Date.diff(started_at_tt, cancelled_at_tt, :secs)/60 <= minutes
    else
      false
    end
  end
end
