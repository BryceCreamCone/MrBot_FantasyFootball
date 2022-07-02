FROM alpine

RUN apk add --update nodejs yarn curl

ADD . .

RUN yarn install

RUN mkdir data && touch data/players.json

RUN curl https://api.sleeper.app/v1/players/nfl > data/players.json

RUN apk del yarn curl

WORKDIR /src

CMD ["node", "main.js"]

