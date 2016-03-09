defmodule Api.Authorizer.Plug do
  require Logger
  import Plug.Conn
  @behaviour Plug
  @authorization_types ["cookie", "authorization"]
  @authorizer Application.get_env(:api, :authorizer)

  def init(opts) do
    opts
  end

  def call(conn, opts) do
    credentials_for(conn)
    |> Enum.reduce(:unauthorized, &attempt_authorization_with/2)
    |> handle_authorization(conn)
  end

  defp credentials_for(conn) do
    Enum.filter_map(@authorization_types, fn(header_name) -> get_req_header(conn, header_name) end, fn(header_name) ->
      header_value = get_req_header(conn, header_name)
      {header_name, header_value}
    end)
  end

  defp attempt_authorization_with({header_name, header_value}, acc) do
    case @authorizer.authorize(header_value, header_name) do
      {:authorized, user} -> {:authorized, user}
      :unauthorized       -> acc
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
