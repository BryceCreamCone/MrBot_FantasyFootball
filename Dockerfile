FROM alpine

RUN apk add --update nodejs yarn curl

ADD . .

RUN yarn install

RUN touch players.json

RUN curl https://api.sleeper.app/v1/players/nfl > players.json

RUN apk del yarn curl

WORKDIR /src

CMD ["node", "--experimental-json-modules", "main.js"]

