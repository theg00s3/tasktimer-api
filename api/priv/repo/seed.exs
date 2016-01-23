alias Api.Models.Pomodoro

defmodule TimeHelpers do
  def datetime_for(hour) do
    {:ok, time} = Ecto.Time.cast(hour)
    Ecto.DateTime.from_date_and_time(Ecto.Date.utc, time)
  end
end

user_id  = 2662706

pomodoros = [
  %Pomodoro{
    type: "pomodoro",
    minutes: 25,
    started_at: TimeHelpers.datetime_for("09:00:00Z")
  }
]

Enum.each(pomodoros, fn(p) ->
  Api.Repo.create_pomodoro_for(user_id, p)
end)

