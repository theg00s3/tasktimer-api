defmodule Api.Utils.Pagination do
  @pagination Application.get_env(:api, :pagination)

  def page(nil), do: 1
  def page(x) do
    case Integer.parse(x) do
      {page, _} -> page
      :error    -> 1
    end
  end

  def pages(nil, _), do: 1
  def pages(x, _) when is_map(x), do: 1
  def pages(list, pagination \\ @pagination) when is_list(list) do
    count = Enum.count(list)
    round(Float.floor(count / pagination)) + 1
  end

  def paginate(nil, _, _), do: nil
  def paginate(x, _, _) when is_map(x), do: x
  def paginate(list, page \\ 1, pagination \\ @pagination) when is_list(list) do
    list |> Enum.slice((page - 1) * pagination, pagination)
  end
end
