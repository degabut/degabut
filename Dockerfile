FROM node:18.19-alpine as builder
WORKDIR /usr/src/builder
COPY . .
RUN npm i -g pnpm@8.6.0
RUN pnpm i
RUN pnpm build
RUN rm -r node_modules
RUN pnpm i --prod

FROM node:18.19-alpine
ENV CONFIG_PATH=/app/config.yml
WORKDIR /usr/src/app
COPY --from=builder /usr/src/builder .
CMD ["npm", "run", "start:prod"]