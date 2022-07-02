FROM alpine

RUN apk add --update nodejs yarn

ADD . .

RUN yarn install

WORKDIR /src

CMD ["node", "main.js"]

