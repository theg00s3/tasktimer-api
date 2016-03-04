defmodule Api.Authorizer do
  @authorizer_url Application.get_env(:api, :authorizer_url)

  def authorize(header_value, header_name) do
    case HTTPoison.get!(@authorizer_url, [{header_name, header_value}]) do
      %HTTPoison.Response{status_code: 200, body: body, headers: _} -> {:authorized, body}
      %HTTPoison.Response{status_code: 401, body: _, headers: _} -> :unauthorized
    end
  end
end
