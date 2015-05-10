FROM node:0.12.0
ADD . /app
ADD package.json /app/package.json
WORKDIR /app
RUN npm install
CMD ["node", "index.js"]
