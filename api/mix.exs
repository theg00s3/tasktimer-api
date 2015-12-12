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
      {:postgrex, "~> 0.9.1"},
      {:ecto, "~> 1.0.6"},
      {:cowboy, "~> 1.0.3"},
      {:plug, "~> 1.0.2"},
      {:httpoison, "~> 0.8.0"},
      {:poison, "~> 1.5"},
      {:exrm, "~> 0.19.9"},
      {:timex, "~> 1.0.0-rc3"},
    ]
  end
end

