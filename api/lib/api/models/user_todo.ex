defmodule Api.Models.UserTodo do
  use Ecto.Repo
  import Ecto
  import Ecto.Query
  alias Api.Models.UserTodo

  schema "user_todos" do
    field :user_id,          :string
    field :todo_id, :integer
  end

  # query api
  def for_user(query, user_id) do
    from q in query,
      join: upt in UserTodo, on: q.id == upt.todo_id,
      where: upt.user_id == ^user_id,
      select: q
  end
end
