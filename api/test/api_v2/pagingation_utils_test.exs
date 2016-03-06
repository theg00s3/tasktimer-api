defmodule Api.Utils.Pagination.Test do
  use ExUnit.Case, async: true

  alias Api.Utils.Pagination
  @list Enum.slice(1..19, 0, 19)
  @a_map %{}

  test "#page" do
    assert Pagination.page("1") == 1
    assert Pagination.page("2") == 2
    assert Pagination.page("") == 1
    assert Pagination.page(nil) == 1
  end

  test "#pages" do
    custom_pagination = 5
    assert Pagination.pages(@list) == 2
    assert Pagination.pages(@list, custom_pagination) == 4
    assert Pagination.pages(nil) == 1
    assert Pagination.pages(@a_map) == 1
  end

  test "#paginate" do
    page = 1
    pagination = 10
    assert Pagination.paginate(@list, page, pagination) == Enum.slice(1..10, 0, 10)
    assert Pagination.paginate(@list, 2, pagination) == Enum.slice(11..19, 0, 9)
    assert Pagination.paginate(@a_map) == @a_map
    assert Pagination.paginate(nil) == nil
  end
end
