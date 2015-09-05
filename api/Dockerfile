FROM nodesource/precise:0.12.7
ADD package.json /app/package.json
WORKDIR /app
RUN npm install
ADD . /app
CMD ["node", "index.js"]
