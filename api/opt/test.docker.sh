#!/bin/bash

docker run --rm -it \
  --link=pomodoro-api-db-test:pomodoro-api-db \
  --link pomodoro-api-sessions:pomodoro-api-sessions \
  -v /vagrant/credentials.json:/credentials.json \
  -v /vagrant/api:/app \
  christianfei/pomodoro-api \
  npm test
