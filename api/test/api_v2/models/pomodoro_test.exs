defmodule Api.Models.Pomodoro.Test do
  use ExUnit.Case, async: true

  alias Api.Models.Pomodoro
  @base_break %Pomodoro{type: "break", minutes: 5, started_at: Ecto.DateTime.local}
  @base_pomodoro %Pomodoro{type: "pomodoro", minutes: 25, started_at: Ecto.DateTime.local}

  test "validates type" do
    pomodoro = Pomodoro.changeset(%Pomodoro{}, %{type: "invalid_type", minutes: 5, started_at: Ecto.DateTime.local})
    refute pomodoro.valid?
  end

  test "validates minutes for break" do
    assert_minutes_for([5, 15], @base_break)
    refute_minutes_for([25], @base_break)
  end

  test "validates minutes for pomodoro" do
    assert_minutes_for([25], @base_pomodoro)
    refute_minutes_for([5,15], @base_pomodoro)
  end

  test "validates cancelled_at is between started_at and minutes" do
    pomodoro = %Pomodoro{type: "pomodoro", minutes: 25, started_at: TimeHelpers.datetime_for("00:00:00Z")}
    invalid_pomodoro = Pomodoro.changeset(pomodoro, %{cancelled_at: TimeHelpers.datetime_for("00:30:00Z")})
    refute invalid_pomodoro.valid?
  end


  defp create_changeset_for(minutes, pomodoro, cb) do
    Enum.each(minutes, fn(minutes) ->
      cb.(Pomodoro.changeset(pomodoro, %{minutes: minutes}))
    end)
  end
  defp assert_minutes_for(minutes, pomodoro) do
    create_changeset_for(minutes, pomodoro, fn(pomodoro) ->
      assert pomodoro.valid?
    end)
  end
  defp refute_minutes_for(minutes, pomodoro) do
    create_changeset_for(minutes, pomodoro, fn(pomodoro) ->
      refute pomodoro.valid?
    end)
  end
end
