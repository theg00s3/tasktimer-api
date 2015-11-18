FROM mhart/alpine-node:5
# RUN apk add --update git make gcc g++ python
ADD package.json /app/package.json
WORKDIR /app
RUN npm install
ADD . /app
CMD ["node", "index.js"]
