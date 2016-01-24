defmodule PlugUtils do
  import Plug.Conn

  def extract_from(conn) do
    method = extract_method_from(conn)
    url = extract_url_from(conn)
    body = extract_body_from(conn)
    headers = extract_headers_from(conn)
    {method, url, body, headers}
  end

  defp extract_method_from(conn) do
    conn.method
      |> String.downcase
      |> String.to_atom
  end
  defp extract_url_from(conn) do
    url = conn.request_path
    if conn.query_string != "" do
      url = url <> "?" <> conn.query_string
    end
    url
  end
  defp extract_headers_from(conn) do
    conn.req_headers
  end
  defp extract_body_from(conn) do
    {:ok, body, _} = read_body(conn)
    body
  end
end
