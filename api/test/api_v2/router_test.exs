defmodule Api.Router.Test do
  use ExUnit.Case, async: true
  use Plug.Test

  @pomodoro %{type: "pomodoro", minutes: 25, started_at: Ecto.DateTime.utc}

  test "authenticates requests" do
    conn = conn(:get, "/api/pomodoros")
             |> put_req_header("cookie", "invalid")
             |> Api.Router.call([])

    assert conn.status == 401

    conn = conn(:get, "/api/pomodoros")
             |> put_req_header("cookie", "authorized")
             |> Api.Router.call([])

    assert conn.status == 200
  end

  test "creates pomodoro" do
    conn = conn(:post, "/api/pomodoros", @pomodoro)
             |> put_req_header("content-type", "application/json")
             |> put_req_header("cookie", "authorized")
             |> Api.Router.call([])

    assert conn.status == 201
  end

  test "creates todo" do
    conn = conn(:post, "/api/todos", %{text: "just a todo", completed: false})
             |> put_req_header("content-type", "application/json")
             |> put_req_header("cookie", "authorized")
             |> Api.Router.call([])

    assert conn.status == 201
  end

  test "associates pomodoro to todo" do
  end
end
