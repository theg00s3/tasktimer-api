defmodule Api.Authorizer do
  @authorizer_url Application.get_env(:api, :authorizer_url)

  def authorize(cookie) do
    case HTTPoison.get!(@authorizer_url, [{"cookie", cookie}]) do
      %HTTPoison.Response{status_code: 200, body: body, headers: _} -> {:authorized, body}
      %HTTPoison.Response{status_code: 401, body: _, headers: _} -> :unauthorized
    end
  end
end
