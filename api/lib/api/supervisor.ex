defmodule Api.Supervisor do
  use Supervisor

  def start_link do
    Supervisor.start_link(__MODULE__, [])
  end

  def init(_) do
    IO.puts "-- Supervisor started"
    children = [
      worker(Api.Worker,[]),
      worker(Api.Repo, []),
    ]
    supervise(children, strategy: :one_for_one)
  end
end
