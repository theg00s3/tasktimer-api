# FROM msaraiva/elixir
FROM bitwalker/alpine-elixir:1.4.0

RUN apk --update add postgresql-client && rm -rf /var/cache/apk/*

ADD mix.exs /app/mix.exs
WORKDIR /app
RUN mix --version
RUN elixir --version
RUN yes | mix local.hex
ENV MIX_ENV prod
ENV HEX_EXPERIMENTAL_RESOLVER 1
RUN mix deps.get
ADD . /app
RUN mix compile
RUN mix compile.protocols
EXPOSE 6000

# USER DEFAULT

CMD ["mix","run","--no-halt"]
