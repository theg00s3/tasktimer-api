defmodule Utils do
  def extract_user_id_from(xs) when is_map(xs) do
    Dict.get(xs, "id")
    |> Integer.to_string
  end
end
