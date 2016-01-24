defmodule Api.Cron do
  use GenServer
  @every_minute 60 * 1000

  # genserver api
  def start_link(function, interval \\ @every_minute) do
    IO.puts "-- started Cron, running every #{interval/1000}s"
    IO.inspect function
    GenServer.start_link(__MODULE__, %{function: function, interval: interval})
  end

  def init(state) do
    loop(state)
    run_cron(state)
    {:ok, state}
  end

  def handle_info(:loop, state) do
    loop(state)
    {:noreply, state}
  end


  # module api
  def loop(state) do
    interval = Map.get(state, :interval)
    Process.send_after(self(), :loop, interval)
  end

  def run_cron(state) do
    function = Map.get(state, :function)
    IO.puts "-- Api.Cron: running"
    IO.inspect function
    function.()
  end
end
