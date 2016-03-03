defmodule Api.FakeAuthorizer do
  def authorize(cookie, :cookie) do
    case "#{cookie}" do
      "authorized" -> {:authorized, "{\"id\": 1, \"username\": \"test\"}"}
      _            -> :unauthorized
    end
  end
  def authorize(authorization, :authorization) do
    case "#{authorization}" do
      "token 123fake" -> {:authorized, "{\"id\": 1, \"username\": \"test\"}"}
      _            -> :unauthorized
    end
  end
end
