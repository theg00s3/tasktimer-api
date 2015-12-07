defmodule Api.FakeAuthorizer do
  def authorize(cookie) do
    case "#{cookie}" do
      "authorized" -> {:authorized, "{\"id\": 1, \"username\": \"test\"}"}
      _            -> :unauthorized
    end
  end
end
