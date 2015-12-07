defmodule Api.Router.Test do
  use ExUnit.Case, async: true
  use Plug.Test

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
end
