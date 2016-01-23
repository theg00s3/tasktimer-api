defmodule Api.Mixfile do
  use Mix.Project

  def project do
    [app: :api,
     version: "0.0.1",
     elixir: "~> 1.0",
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     deps: deps]
  end

  def application do
    [
      applications: [:logger, :tzdata, :cowboy, :plug, :httpoison, :postgrex, :ecto],
      mod: {Api, []},
    ]
  end

  defp deps do
    [
      {:postgrex, "~> 0.11.0"},
      {:ecto, "~> 1.1.1"},
      {:cowboy, "~> 1.0.4"},
      {:plug, "~> 1.1.0"},
      {:httpoison, "~> 0.8.1"},
      {:poison, "~> 1.5.2"},
      {:timex, "~> 0.19.2"},
      {:timex_ecto, "~> 0.7.0"},
    ]
  end
end

