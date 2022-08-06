FROM node:16.14-alpine

WORKDIR /usr/src/app

ADD . .

CMD ["yarn", "start"]