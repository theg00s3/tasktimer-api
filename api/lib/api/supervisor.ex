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
      supervisor(Api.Repo, []),
      worker(Api.Cron, [
        &Api.Repo.complete_obsolete_pomodori/0, @every_minute
      ]),
    ]
    supervise(children, strategy: :one_for_one)
  end
end
