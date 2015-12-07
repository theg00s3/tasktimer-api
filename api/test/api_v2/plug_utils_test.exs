defmodule Api.PlugUtils.Test do
  use ExUnit.Case, async: true
  use Plug.Test

  defmodule DummyRouter do
    use Plug.Router
    plug :match
    plug :dispatch
    match _ do
      send_resp(conn, 200, "")
    end
  end

  test "extract_from" do
    conn = conn(:get, "/")
             |> put_req_header("x-custom", "foo")
             |> DummyRouter.call([])

    {method, url, body, headers} = PlugUtils.extract_from(conn)

    assert method == :get
    assert url == "/"
    assert body == ""
    assert headers == [{"x-custom","foo"}]
  end

  @tag :skip
  test "reads chunked body" do
  end
end
