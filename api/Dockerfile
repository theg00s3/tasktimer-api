FROM msaraiva/elixir-dev

RUN apk --update add postgresql-client && rm -rf /var/cache/apk/*

ADD mix.exs /app/mix.exs
WORKDIR /app
ENV MIX_ENV prod
RUN mix deps.get --force
ADD . /app
RUN mix compile
RUN mix compile.protocols
EXPOSE 6000

CMD ["mix","run","--no-halt"]
