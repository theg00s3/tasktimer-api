defmodule Api.FakeAuthorizer do

  def authorize(header_value, header_name) do
    case "#{header_value}" do
      "authorized"     -> {:authorized, "{\"id\": 1, \"username\": \"test\"}"}
      "token 123fake"  -> {:authorized, "{\"id\": 1, \"username\": \"test\"}"}
      _                -> :unauthorized
    end
  end
end
