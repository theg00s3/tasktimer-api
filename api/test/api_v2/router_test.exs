defmodule Api.Router.Test do
  use ExUnit.Case, async: true
  use Plug.Test

  @pomodoro %{type: "pomodoro", minutes: 25, started_at: Ecto.DateTime.utc}
  @todo     %{text: "just a todo", completed: false}

  test "creates pomodoro" do
    conn = create_pomodoro
    {:ok, location} = get_header(conn.resp_headers, "location")

    assert conn.status == 201
    assert Regex.match?(~r/^\/api\/pomodoros\/\d*$/, location)
  end

  test "gets pomodoro" do
    conn = create_pomodoro
    {:ok, location} = get_header(conn.resp_headers, "location")
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
    {:ok, location} = get_header(conn.resp_headers, "location")
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

  defp get_header(headers, header_name) when is_list(headers) do
    filtered = Enum.filter headers, fn header -> elem(header, 0) == header_name end
    case filtered do
      [] -> {:error}
      [{^header_name, value}]  -> {:ok, value}
    end
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

    {:ok, pomodoro_location} = get_header(pomodoro_conn.resp_headers, "location")
    {:ok, todo_location} = get_header(todo_conn.resp_headers, "location")

    pomodoro_id = get_resource_id(pomodoro_location)
    todo_id = get_resource_id(todo_location)

    authorized_request(:post, "/api/pomodoros/#{pomodoro_id}/todos/#{todo_id}") |> Api.Router.call([])
  end
end
