defmodule Api.Supervisor do
  use Supervisor
  @every_minute 60*1000

  def start_link do
    Supervisor.start_link(__MODULE__, [])
  end

  def init(_) do
    IO.puts "-- Supervisor started"
    children = [
      worker(Api.HttpServer,[]),
      worker(Api.Repo, []),
      worker(Api.Cron, [fn ->
        Api.Repo.obsolete_pomodori
        |> Enum.each(&Api.Repo.complete_pomodoro(&1))
      end, @every_minute]),
    ]
    supervise(children, strategy: :one_for_one)
  end
end
