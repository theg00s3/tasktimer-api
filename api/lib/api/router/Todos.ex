defmodule Api.Router.Todos do
  use Plug.Router

  alias Api.Repo
  alias Api.Models.Todo

  plug :match
  plug :dispatch

  get "/" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    conn = fetch_query_params(conn)
    query = conn.query_params
    todos = case query do
      %{"completed" => _, "day" => day } -> Repo.daily_completed_todos_for(user_id, day)
      _ -> Repo.todos_for(user_id)
    end
    send_resp(conn, 200, Poison.encode!(todos))
  end

  get "/:todo_id" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    todo = Repo.todo_for(user_id, todo_id)
    send_resp(conn, 200, Poison.encode!(todo))
  end

  post "/" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    changeset = Todo.changeset(%Todo{}, conn.params)
    {:ok, todo} = Repo.create_todo_for(user_id, changeset)
    conn
      |> put_resp_header("location", "/api/todos/#{todo.id}")
      |> send_resp(201, Poison.encode!(todo))
  end

  put "/:todo_id" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    old_todo = Repo.todo_for(user_id, todo_id)
    updated_todo = Todo.changeset(old_todo, conn.params)
    {:ok, todos} = Repo.update_todo_for(user_id, updated_todo)
    send_resp(conn, 201, Poison.encode!(todos))
  end

end
