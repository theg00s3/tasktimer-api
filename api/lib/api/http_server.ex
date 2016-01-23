defmodule Api.HttpServer do
  def start_link do
    http_port = Application.get_env(:api, :http_port)
    Plug.Adapters.Cowboy.http(Api.Router, [], port: http_port)
  end
end
