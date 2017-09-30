FROM elixir:1.4.0

ENV REFRESHED_AT 2017-09-30

# Install hex
RUN /usr/local/bin/mix local.hex --force && \
    /usr/local/bin/mix local.rebar --force && \
    /usr/local/bin/mix hex.info

WORKDIR /app

# Copy in only our mix files, the run will only happen if they've changed
COPY mix.exs mix.lock ./
RUN mix do deps.get, deps.compile

# compile.protocols

EXPOSE 6000

# Now copy in the rest of the app
COPY . .

CMD ["mix","run","--no-halt"]

# CMD ["bash"]