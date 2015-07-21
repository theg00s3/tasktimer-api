#!/bin/bash

id_for_container(){
  CONTAINER="$1\s*$"
  CONTAINER_ID="$(docker ps -a | grep "$CONTAINER" | awk '{print $1}')"
  echo $CONTAINER_ID
}

if [ -z "$(id_for_container 'pomodoro-api-db-test')" ]; then
  docker run --name pomodoro-api-db-test -d mongo:latest
fi
if [ -z "$(id_for_container 'pomodoro-api-sessions-test')" ]; then
  docker run --name pomodoro-api-sessions-test -d redis:latest redis-server
fi

docker run --rm -it \
  --link=pomodoro-api-db-test:pomodoro-api-db \
  --link=pomodoro-api-sessions-test:pomodoro-api-sessions \
  --env ENV="DEV" \
  -v /pomodoro.cc/credentials.json:/credentials.json \
  -v /pomodoro.cc/api:/app \
  christianfei/pomodoro-api sh -c 'npm install && npm test'
docker rm -f pomodoro-api-db-test