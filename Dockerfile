FROM node:16.14-alpine as builder
WORKDIR /usr/src/builder
COPY . .
RUN npm i -g pnpm@7.9.0
RUN pnpm i
RUN pnpm build
RUN rm -r node_modules
RUN pnpm i --prod

FROM node:16.14-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/builder .
CMD ["npm", "run", "start:prod"]