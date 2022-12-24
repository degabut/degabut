import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { WsAdapter } from "@nestjs/platform-ws";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    cors: process.env.NODE_ENV === "development",
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.useWebSocketAdapter(new WsAdapter(app));
  app.listen(+(process.env.API_PORT || 8080), "0.0.0.0");
}

bootstrap();
