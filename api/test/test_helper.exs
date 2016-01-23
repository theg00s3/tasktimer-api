ExUnit.start(exclude: [:skip])

defmodule TimeHelpers do
  def datetime_for(hour) do
    {:ok, time} = Ecto.Time.cast(hour)
    Ecto.DateTime.from_date_and_time(Ecto.Date.utc, time)
  end
end
