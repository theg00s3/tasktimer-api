defmodule Api.Models.UserPomodoroTask do
  use Ecto.Model
  import Ecto.Query
  alias Api.Models.UserPomodoroTask

  schema "user_pomodoro_task" do
    field :user_id,          :integer
    field :pomodoro_task_id, :integer
  end

  # query api
  def for_user(query, user_id) do
    from q in query,
      join: upt in UserPomodoroTask, on: q.id == upt.pomodoro_task_id,
      where: upt.user_id == ^user_id,
      select: q
  end
end
