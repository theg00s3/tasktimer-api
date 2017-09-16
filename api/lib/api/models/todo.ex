defmodule Api.Models.Todo do
  use Ecto.Repo
  use Ecto.Schema
  import Ecto
  import Ecto.Query
  alias Api.Models.Todo

  @required_fields ~w(text)
  @optional_fields ~w(completed completed_at deleted order)

  schema "todos" do
    field :text,         :string
    field :completed,    :boolean, default: false
    field :completed_at, Ecto.DateTime
    field :deleted,      :boolean, default: false
    field :order,        :integer
    timestamps
  end




  # changeset
  def changeset(model, params) do
    if Map.has_key?(params, "completed") do
      if Map.get(params, "completed") do
        params = Map.put params, "completed_at", Ecto.DateTime.utc
      else
        params = Map.delete params, "completed_at"
      end
    end
    cast(model, params, @required_fields, @optional_fields)
  end
end
