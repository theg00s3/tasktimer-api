defmodule Api.Router.Pomodoros do
  use Plug.Router

  alias Api.Repo
  alias Api.Models.Pomodoro

  plug :match
  plug :dispatch

  @apidoc """
  @api {get} /api/pomodoros Get pomodoros
  @apiGroup Pomodoros
  @apiDescription Get all pomodoros

  @apiHeader {String} Authorization Users unique api-key.
  @apiHeader {String} Cookie Users browser cookie.

  @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
    [{
      "updated_at": "2016-02-20T13:45:19Z",
      "type": "pomodoro",
      "todos": [],
      "started_at": "2016-02-20T13:20:17.332000Z",
      "minutes": 25,
      "inserted_at": "2016-02-20T13:20:17Z",
      "id": 1,
      "finished": true,
      "cancelled_at": null
    }]
  """
  get "/" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    conn = fetch_query_params(conn)
    query_params = conn.query_params
    response = case query_params do
      %{"day" => day}       -> Repo.daily_pomodoros_for(user_id, day)
      %{"unfinished" => _}  -> Repo.unfinished_pomodoro_for(user_id)
      _                     -> Repo.pomodoros_for(user_id)
    end

    send_resp(conn, 200, Poison.encode!(response))
  end

  @apidoc """
  @api {get} /api/pomodoros/:id Get pomodoro
  @apiGroup Pomodoros
  @apiDescription Get pomodoro

  @apiHeader {String} Authorization Users unique api-key.
  @apiHeader {String} Cookie Users browser cookie.

  @apiParam {String} [id] id of the pomodoro

  @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
      {
        "updated_at": "2016-02-20T13:45:19Z",
        "type": "pomodoro",
        "todos": [],
        "started_at": "2016-02-20T13:20:17.332000Z",
        "minutes": 25,
        "inserted_at": "2016-02-20T13:20:17Z",
        "id": 1,
        "finished": true,
        "cancelled_at": null
      }
  """
  get "/:pomodoro_id" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    pomodoro = Repo.pomodoro_for(user_id, pomodoro_id)
    send_resp(conn, 200, Poison.encode!(pomodoro))
  end


  @apidoc """
  @api {post} /api/pomodoros Create pomodoro
  @apiGroup Pomodoros
  @apiDescription Create pomodoro

  @apiHeader {String} Authorization Users unique api-key.
  @apiHeader {String} Cookie Users browser cookie.

  @apiParamExample {json} Request-Example:
      {
        "type": "pomodoro",
        "started_at": "2016-02-20T13:20:17.332000Z",
        "minutes": 25
      }
  """
  post "/" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    changeset = Pomodoro.changeset(%Pomodoro{}, conn.params)
    {:ok, pomodoro} = Repo.create_pomodoro_for(user_id, changeset)
    conn
      |> put_resp_header("location", "/api/pomodoros/#{pomodoro.id}")
      |> send_resp(201, Poison.encode!(pomodoro))
  end

  @apidoc """
  @api {put} /api/pomodoros Update pomodoro
  @apiGroup Pomodoros
  @apiDescription Update pomodoro

  @apiHeader {String} Authorization Users unique api-key.
  @apiHeader {String} Cookie Users browser cookie.

  @apiParamExample {json} Request-Example:
      {
        "type": "pomodoro",
        "started_at": "2016-02-20T13:20:17.332000Z",
        "cancelled_at": "2016-02-20T13:25:17.332000Z",
        "minutes": 25
      }
  """
  put "/:pomodoro_id" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    old_pomodoro = Repo.pomodoro_for(user_id, pomodoro_id)
    updated_pomodoro = Pomodoro.changeset(old_pomodoro, conn.params)
    {:ok, pomodoro} = Repo.update_pomodoro_for(user_id, updated_pomodoro)
    send_resp(conn, 200, Poison.encode!(pomodoro))
  end

  @apidoc """
  @api {post} /api/pomodoros/:pomodoro_id/todos/:todo_id Associate Pomodoro to Todo
  @apiGroup Pomodoros
  @apiDescription Associate Pomodoro to Todo

  @apiHeader {String} Authorization Users unique api-key.
  @apiHeader {String} Cookie Users browser cookie.
  """
  post "/:pomodoro_id/todos/:todo_id" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    status_code = case Repo.associate_todo_to_pomodoro(user_id, todo_id, pomodoro_id) do
      {:ok, _} -> 201
      {:error, error} -> 400
    end
    send_resp(conn, status_code, "")
  end

  @apidoc """
  @api {post} /api/pomodoros/:pomodoro_id/todos/:todo_id Delete Association Pomodoro to Todo
  @apiGroup Pomodoros
  @apiDescription Delete Association Pomodoro to Todo

  @apiHeader {String} Authorization Users unique api-key.
  @apiHeader {String} Cookie Users browser cookie.
  """
  delete "/:pomodoro_id/todos/:todo_id" do
    user_id = Utils.extract_user_id_from(conn.assigns[:user])
    status_code = case Repo.deassociate_todo_to_pomodoro(user_id, todo_id, pomodoro_id) do
      {:ok, _} -> 204
      {:error, error} -> 400
      _               -> 500
    end
    send_resp(conn, status_code, "")
  end

end
