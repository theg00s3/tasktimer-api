defmodule Api.Mixfile do
  use Mix.Project

  def project do
    [
      app: :api,
      version: "0.0.1",
      elixir: "~> 1.0",
      build_embedded: Mix.env == :prod,
      start_permanent: Mix.env == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      applications: [:logger, :tzdata, :cowboy, :plug, :httpoison, :postgrex, :ecto],
      mod: {Api, []},
    ]
  end

  defp deps do
    [
      {:postgrex, "~> 0.13.3"},
      {:ecto, "~> 2.2.4"},
      {:cowboy, "~> 1.1.2"},
      {:plug, "~> 1.4.3"},
      {:httpoison, "~> 0.13.0"},
      {:poison, "~> 3.1.0"},
      {:timex, "~> 2.1.5"},
      {:timex_ecto, "~> 1.1.3"},
    ]
  end
end

