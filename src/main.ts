import { ApiModule } from "@api/api.module";
import { ConfigUtil } from "@common/config";
import { GlobalLogger } from "@logger/global-logger.service";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { YoutubeApiModule } from "@youtube-api/youtube-api.module";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "node:path";

import { AppModule } from "./app.module";

async function bootstrap() {
  // load env file
  ConfigModule.forRoot();

  const config = await ConfigUtil.getConfig();
  const app = await NestFactory.createApplicationContext(AppModule.forRoot(config), {
    bufferLogs: true,
  });
  app.useLogger(app.get(GlobalLogger));
}

async function generateDocs(docPath: string) {
  const options = {
    auth: { jwt: { secret: "secret" } },
  } as any;

  const api = await NestFactory.create(ApiModule.forRoot(options), new FastifyAdapter());
  const youtubeApi = await NestFactory.create(
    YoutubeApiModule.forRoot(options),
    new FastifyAdapter(),
  );

  const apiOptions = new DocumentBuilder()
    .setTitle("API")
    .setDescription("Documentation for the core API")
    .setVersion("1.0")
    .build();

  const youtubeApiOptions = new DocumentBuilder()
    .setTitle("Youtube API")
    .setDescription("Documentation for the Youtube API")
    .setVersion("1.0")
    .build();

  const apiDocument = SwaggerModule.createDocument(api, apiOptions);
  const youtubeApiDocument = SwaggerModule.createDocument(youtubeApi, youtubeApiOptions);

  mkdirSync(docPath, { recursive: true });
  writeFileSync(join(docPath, "api.json"), JSON.stringify(apiDocument));
  writeFileSync(join(docPath, "youtube-api.json"), JSON.stringify(youtubeApiDocument));

  api.close();
  youtubeApi.close();
}

if (process.env.DOC_PATH) {
  generateDocs(process.env.DOC_PATH);
} else {
  bootstrap();
}
