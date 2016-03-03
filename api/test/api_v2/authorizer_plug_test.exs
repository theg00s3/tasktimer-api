defmodule Api.Authorizer.Plug.Test do
  use ExUnit.Case, async: false
  use Plug.Test

  alias Api.Authorizer.Plug, as: AuthorizerPlug

  test "when unauthorized responds with 401" do
    conn = conn(:get, "/")
             |> put_req_header("cookie", "unauthorized")
             |> AuthorizerPlug.call([])

    assert conn.status == 401
    assert conn.state == :sent
  end

  test "authorizes with cookie" do
    conn = conn(:get, "/")
             |> put_req_header("cookie", "authorized")
             |> AuthorizerPlug.call([])

    assert conn.state == :unset
    assert conn.status == nil
    assert conn.assigns[:user] == %{"id" => 1, "username" => "test"}
  end

  test "authorizes with key" do
    conn = conn(:get, "/")
             |> put_req_header("authorization", "token 123fake")
             |> AuthorizerPlug.call([])

    assert conn.state == :unset
    assert conn.status == nil
    assert conn.assigns[:user] == %{"id" => 1, "username" => "test"}
  end
end
