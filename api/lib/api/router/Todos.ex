defmodule Api.Router.Todos do
  use Plug.Router

  alias Api.Repo
  alias Api.Models.Todo

  plug :match
  plug :dispatch

  @apidoc """
  @api {get} /api/todos Get todos in progress
  @apiGroup Todos
  @apiDescription Get todos in progress

  @apiHeader {String} Authorization Users unique api-key.
  @apiHeader {String} Cookie Users browser cookie.

  @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
      [{
        "updated_at": "2016-03-03T21:03:53Z",
        "text": "a todo",
        "order": 0,
        "inserted_at": "2016-03-03T17:41:30Z",
        "id": 1023,
        "deleted": false,
        "completed_at": "2016-03-03T21:03:51Z",
        "completed": false
      }]
  """
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

  @apidoc """
  @api {get} /api/todos/:id Get todo
  @apiGroup Todos
  @apiDescription Get todo

  @apiHeader {String} Authorization Users unique api-key.
  @apiHeader {String} Cookie Users browser cookie.

  @apiParam {String} [id] id of the todo

  @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
      {
        "updated_at": "2016-03-03T21:03:53Z",
        "text": "1",
        "order": 0,
        "inserted_at": "2016-03-03T17:41:30Z",
        "id": 1023,
        "deleted": false,
        "completed_at": "2016-03-03T21:03:51Z",
        "completed": false
      }
  """
  get "/:todo_id" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    todo = Repo.todo_for(user_id, todo_id)
    send_resp(conn, 200, Poison.encode!(todo))
  end

  @apidoc """
  @api {post} /api/todos Create todo
  @apiGroup Todos
  @apiDescription Create todo

  @apiHeader {String} Authorization Users unique api-key.
  @apiHeader {String} Cookie Users browser cookie.

  @apiParamExample {json} Request-Example:
    {
      "text": "1",
      "order": 0,
      "deleted": false,
      "completed": false
    }
  """
  post "/" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    changeset = Todo.changeset(%Todo{}, conn.params)
    {:ok, todo} = Repo.create_todo_for(user_id, changeset)
    conn
      |> put_resp_header("location", "/api/todos/#{todo.id}")
      |> send_resp(201, Poison.encode!(todo))
  end

  @apidoc """
  @api {put} /api/todos Update todo
  @apiGroup Todos
  @apiDescription Update todo

  @apiHeader {String} Authorization Users unique api-key.
  @apiHeader {String} Cookie Users browser cookie.

  @apiParamExample {json} Request-Example:
    {
      "text": "2",
      "order": 0,
      "deleted": false,
      "completed": false
      "completed_at": "2016-03-03T21:03:51Z"
    }
  """
  put "/:todo_id" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    old_todo = Repo.todo_for(user_id, todo_id)
    updated_todo = Todo.changeset(old_todo, conn.params)
    {:ok, todos} = Repo.update_todo_for(user_id, updated_todo)
    send_resp(conn, 201, Poison.encode!(todos))
  end

end
