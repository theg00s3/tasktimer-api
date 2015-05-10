#!/bin/bash
docker run --rm -it -v /vagrant/services/pomodoro-api/credentials:/app/credentials --link pomodoro-api-sessions:pomodoro-api-sessions --link pomodoro-api-db-test:pomodoro-api-db -v /vagrant/services/pomodoro-api:/app christianfei/pomodoro-api sh -c "NODE_ENV=testdocker npm test"
