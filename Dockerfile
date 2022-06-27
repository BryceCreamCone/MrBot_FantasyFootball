FROM node:14-buster-slim

ADD . .

RUN yarn install

RUN touch players.json

RUN apt-get update && apt-get -y install curl && curl https://api.sleeper.app/v1/players/nfl > players.json

WORKDIR /src

CMD ["node", "--experimental-json-modules", "main.js"]

