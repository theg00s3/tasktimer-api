defmodule Api.Authorizer.Plug do
  require Logger
  import Plug.Conn
  @behaviour Plug
  @authorizer Application.get_env(:api, :authorizer)

  def init(opts) do
    opts
  end

  def call(conn, opts) do
    authorizer = Keyword.get(opts, :authorizer, @authorizer)
    cookie = get_req_header(conn, "cookie")
    authorization = get_req_header(conn, "authorization")
    IO.inspect cookie
    IO.inspect authorization
    case {cookie, authorization} do
      {[], []} -> handle_authorization(:unauthorized, conn)
      {cookie, []} -> cookie |> authorizer.authorize(:cookie) |> handle_authorization(conn)
      {[], authorization} -> authorization |> authorizer.authorize(:authorization) |> handle_authorization(conn)
    end
  end

  defp handle_authorization({:authorized, user}, conn) do
    user_struct = Poison.decode!(user)
    conn
    |> assign(:user, user_struct)
  end

  defp handle_authorization(:unauthorized, conn) do
    conn
    |> send_resp(401, "Unauthorized")
    |> halt
  end
end
