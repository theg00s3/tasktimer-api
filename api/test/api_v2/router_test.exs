defmodule Api.Router.Test do
  use ExUnit.Case, async: true
  use Plug.Test

  @pomodoro %{type: "pomodoro", minutes: 25, started_at: Ecto.DateTime.utc}
  @todo     %{text: "just a todo", completed: false}

  test "authorizes request with token" do
    conn = conn(:get, "/api/pomodoros")
    |> put_req_header("content-type", "application/json")
    |> put_req_header("authorization", "token 123fake")
    |> Api.Router.call([])

    assert conn.status == 200
  end

  test "creates pomodoro" do
    conn = create_pomodoro
    location = get_header(conn, "location")

    assert conn.status == 201
    assert Regex.match?(~r/^\/api\/pomodoros\/\d*$/, location)
  end

  test "gets pomodoro" do
    conn = create_pomodoro
    location = get_header(conn, "location")
    conn = authorized_request(:get, location)
             |> Api.Router.call([])

    assert conn.status == 200
  end

  test "gets pomodoros" do
    create_pomodoro
    conn = authorized_request(:get, "/api/pomodoros")
             |> Api.Router.call([])

    assert conn.status == 200
  end

  test "creates todo" do
    conn = create_todo

    assert conn.status == 201
    location = get_header(conn, "location")
    assert Regex.match?(~r/^\/api\/todos\/\d*$/, location)
  end

  test "associates pomodoro to todo" do
    association_conn = create_pomodoro_todo_association

    assert association_conn.status == 201
  end

  test "deassociates pomodoro to todo" do
    resource_location = create_pomodoro_todo_association
                        |> Map.get(:request_path)

    deassociation_conn = authorized_request(:delete, resource_location) |> Api.Router.call([])
    assert deassociation_conn.status == 204
  end




  defp authorized_request(type, endpoint, body \\ "") do
    conn(type, endpoint, body)
     |> put_req_header("content-type", "application/json")
     |> put_req_header("cookie", "authorized")
  end

  defp get_resource_id(resource_location) do
    capture = Regex.run ~r/^\/api\/[a-z]*\/(.*)$/, resource_location
    [_, id] = capture
    id
  end

  defp create_pomodoro do
    authorized_request(:post, "/api/pomodoros", @pomodoro)
    |> Api.Router.call([])
  end
  defp create_todo do
    authorized_request(:post, "/api/todos", @todo)
    |> Api.Router.call([])
  end

  defp create_pomodoro_todo_association do
    pomodoro_conn = create_pomodoro
    todo_conn = create_todo

    pomodoro_location = get_header(pomodoro_conn, "location")
    todo_location = get_header(todo_conn, "location")

    pomodoro_id = get_resource_id(pomodoro_location)
    todo_id = get_resource_id(todo_location)

    authorized_request(:post, "/api/pomodoros/#{pomodoro_id}/todos/#{todo_id}") |> Api.Router.call([])
  end

  defp get_header(conn, header_name) do
    hd(get_resp_header(conn, header_name))
  end
end
