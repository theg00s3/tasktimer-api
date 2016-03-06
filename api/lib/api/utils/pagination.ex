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
  def pages(set, pagination \\ @pagination) do
    count = Enum.count(set)
    round(Float.floor(count / pagination)) + 1
  end

  def paginate(nil, _,_), do: nil
  def paginate(set, page \\ 1, pagination \\ @pagination) do
    set |> Enum.slice((page - 1) * pagination, pagination)
  end
end
