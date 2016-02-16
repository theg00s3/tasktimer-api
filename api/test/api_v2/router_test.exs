defmodule Api.Router.Test do
  use ExUnit.Case, async: true
  use Plug.Test

  @pomodoro %{type: "pomodoro", minutes: 25, started_at: Ecto.DateTime.utc}
  @todo     %{text: "just a todo", completed: false}

  test "authenticates requests" do
    conn = conn(:get, "/api/pomodoros")
             |> put_req_header("cookie", "invalid")
             |> Api.Router.call([])

    assert conn.status == 401

    conn = authorized_request(:get, "/api/pomodoros")
             |> put_req_header("cookie", "authorized")
             |> Api.Router.call([])

    assert conn.status == 200
  end

  test "creates pomodoro" do
    conn = authorized_request(:post, "/api/pomodoros", @pomodoro)
             |> Api.Router.call([])

    assert conn.status == 201
    {:ok, location} = get_header(conn.resp_headers, "location")
    assert Regex.match?(~r/^\/api\/pomodoros\/\d*$/, location)
  end

  test "creates todo" do
    conn = authorized_request(:post, "/api/todos", @todo)
             |> Api.Router.call([])

    assert conn.status == 201
    {:ok, location} = get_header(conn.resp_headers, "location")
    assert Regex.match?(~r/^\/api\/todos\/\d*$/, location)
  end

  @tag :skip
  test "associates pomodoro to todo" do
    pomodoro_conn = authorized_request(:post, "/api/pomodoros", @pomodoro) |> Api.Router.call([])
    todo_conn = authorized_request(:post, "/api/todos", @todo) |> Api.Router.call([])

    {:ok, pomodoro_location} = get_header(pomodoro_conn.resp_headers, "location")
    {:ok, todo_location} = get_header(todo_conn.resp_headers, "location")
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
end
