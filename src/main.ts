import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { WsAdapter } from "@nestjs/platform-ws";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    cors: process.env.NODE_ENV === "development",
    logger: process.env.NODE_ENV === "development" ? ["verbose"] : ["error", "warn"],
  });
  app.useWebSocketAdapter(new WsAdapter(app));
  app.listen(8080);
}

bootstrap();
