api for pomodoro.cc

## requirements

- up
- aws account configured (~/.aws or env)
- node 8+

## installation

```
npm i
```

## test

```
env MONGO_URL=mongodb://localhost:27017/test NODE_ENV=test npm start # or change in .env
env MONGO_URL=mongodb://localhost:27017/test npm t
```

## deployment with up

please install & configure [`up`](https://apex.github.io/up/) and setup your aws credentials

### deploy a stage

```
up deploy [production|development] -v
```

## test

configure MONGO_URL in `.env`

```
ENV=test npm start
npm t
```

### deploy all

```
npm run deploy

npm run stack:apply
```

### apply changes to stack

This command applies changes to Route 53 endpoints, Cloudfront aliases and stages dns mapping.

```
npm run stack:apply

# or

up stack plan -v && up stack apply -v
```
