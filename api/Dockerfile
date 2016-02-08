FROM msaraiva/elixir-dev

RUN apk --update add postgresql-client && rm -rf /var/cache/apk/*

ADD mix.exs /app/mix.exs
WORKDIR /app
RUN yes | mix local.hex
ENV MIX_ENV prod
ENV HEX_EXPERIMENTAL_RESOLVER 1
RUN mix deps.get
ADD . /app
RUN mix compile
RUN mix compile.protocols
EXPOSE 6000

CMD ["mix","run","--no-halt"]
