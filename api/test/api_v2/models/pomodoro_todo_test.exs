defmodule Api.Models.PomodoroTodo.Test do
  use ExUnit.Case, async: true

  alias Api.Models.PomodoroTodo

  test "can associate a pomodoro to a todo" do
    pomodoro_todo = PomodoroTodo.changeset(%PomodoroTodo{}, %{pomodoro_id: 1, todo_id: 1})
    assert pomodoro_todo.valid?
  end
end
