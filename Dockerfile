FROM node:16.14-alpine

WORKDIR /usr/src/app

COPY package.json ./

COPY yarn.lock ./

RUN yarn install --prod

ADD . .

CMD ["yarn", "start"]