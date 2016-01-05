defmodule Api.Repo.Test do
  use ExUnit.Case, async: false

  alias Api.Repo
  alias Api.Models.Pomodoro
  alias Api.Models.UserPomodoro
  alias Api.Models.PomodoroTask
  alias Api.Models.UserPomodoroTask

  @user_id 1
  @pomodoro %Pomodoro{minutes: 5, type: "break", started_at: Ecto.DateTime.local}
  @pomodoro_task %PomodoroTask{text: "test pomodoro_task"}
  @updated_text "Rephrasing the task text"

  setup do
    Repo.delete_all(UserPomodoroTask)
    Repo.delete_all(PomodoroTask)
    Repo.delete_all(UserPomodoro)
    Repo.delete_all(Pomodoro)
    :ok
  end

  # tasks
  test "#create_pomodoro_task_for" do
    {:ok, _pomodoro_task} = Repo.create_pomodoro_task_for(@user_id, @pomodoro_task)
  end

  test "#tasks_for" do
    assert Repo.tasks_for(@user_id) == []
    {:ok, pomodoro_task} = create_pomodoro_task
    assert Repo.tasks_for(@user_id) == [pomodoro_task]
  end

  test "#task_for" do
    assert Repo.task_for(@user_id, 0) == nil
    {:ok, pomodoro_task} = create_pomodoro_task
    assert Repo.task_for(@user_id, pomodoro_task.id) == pomodoro_task
  end

  test "#update_pomodoro_task_for" do
    {:ok, pomodoro_task} = create_pomodoro_task
    updated_pomodoro_task = PomodoroTask.changeset(pomodoro_task, %{text: @updated_text, completed: true})
    Repo.update_pomodoro_task_for(@user_id, updated_pomodoro_task)
    updated_pomodoro_task_in_db = Repo.task_for(@user_id, pomodoro_task.id)
    assert updated_pomodoro_task_in_db.text == @updated_text
    assert updated_pomodoro_task_in_db.completed_at
  end



  # pomodoros
  test "#create_pomodoro_for" do
    {:ok, _pomodoro_task} = Repo.create_pomodoro_for(@user_id, @pomodoro)
  end

  test "#pomodoro_for" do
    assert Repo.pomodoro_for(@user_id, 0) == nil
    {:ok, pomodoro} = create_pomodoro
    assert Repo.pomodoro_for(@user_id, pomodoro.id) == pomodoro
  end

  test "#daily_pomodoros_for" do
    today_dt = Timex.Date.universal
    tomorrow_dt = Timex.Date.add(today_dt, {60*60*24/1000000, 0, 0})
    today = today_dt |> Timex.DateFormat.format!("{YYYY}/{0M}/{0D}")
    tomorrow = tomorrow_dt |> Timex.DateFormat.format!("{YYYY}/{0M}/{0D}")
    assert Repo.daily_pomodoros_for(@user_id, today) == []
    {:ok, pomodoro} = create_pomodoro
    assert Repo.daily_pomodoros_for(@user_id, today) == [pomodoro]
    assert Repo.daily_pomodoros_for(@user_id, tomorrow) == []
  end

  @tag :skip
  test "#update_pomodoros_for" do
    {:ok, pomodoro} = create_pomodoro
    updated_pomodoro = Pomodoro.changeset(pomodoro, %{cancelled_at: pomodoro.started_at})
    Repo.update_pomodoros_for(@user_id, updated_pomodoro)
    updated_pomodoro_in_db = Repo.pomodoro_for(@user_id, pomodoro.id)
    assert updated_pomodoro_in_db.cancelled_at == pomodoro.started_at
  end

  defp create_pomodoro do
    Repo.create_pomodoro_for(@user_id, @pomodoro)
  end

  defp create_pomodoro_task do
    Repo.create_pomodoro_task_for(@user_id, @pomodoro_task)
  end
end
