defmodule Api.Models.Pomodoro.Query do
  import Ecto.Query
  alias Api.Models.Pomodoro

  @one_day {60*60*24/1000000, 0, 0}

  # query api
  def all do
    from p in Pomodoro
  end

  def get(query, pomodoro_id) do
    from p in query,
      where: p.id == ^pomodoro_id
  end
  def get(pomodoro_id) do
    get(all(), pomodoro_id)
  end

  def daily(query, day) do
    {beginning_day, ending_day} = get_date_range(day)
    from p in query,
      where: p.started_at >= ^beginning_day,
      where: p.started_at < ^ending_day
  end
  def daily(day) do
    daily(all(), day)
  end

  def unfinished(query \\ all()) do
    from p in query,
      where: (p.finished == false),
      limit: 1,
      order_by: [desc: :started_at]
  end

  def obsolete(query \\ all()) do
    obsolete_started_at_5 = obsolete_started_at_for_minutes(5)
    obsolete_started_at_15 = obsolete_started_at_for_minutes(15)
    obsolete_started_at_25 = obsolete_started_at_for_minutes(25)

    from p in query,
      where: ((p.started_at < ^obsolete_started_at_5 and p.minutes == 5)
              or (p.started_at < ^obsolete_started_at_15 and p.minutes == 15)
              or (p.started_at < ^obsolete_started_at_25 and p.minutes == 25))
            and (p.finished == false)
  end

  defp obsolete_started_at_for_minutes(minutes) do
    Timex.DateTime.universal |> Timex.subtract({0, minutes*60, 0})
  end


  defp get_date_range(day) do
    beginning_day = Timex.Ecto.DateFormat.parse!(day, "{YYYY}/{0M}/{0D}")
    ending_day = Timex.DateTime.add(beginning_day, @one_day)
    beginning_day = beginning_day
      |> Timex.DateTime.Convert.to_erlang_datetime
      |> Ecto.DateTime.from_erl
    ending_day = ending_day
      |> Timex.DateTime.Convert.to_erlang_datetime
      |> Ecto.DateTime.from_erl
    {beginning_day, ending_day}
  end
end
