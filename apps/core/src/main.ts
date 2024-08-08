import { ConfigUtil } from "@common/config";
import { GlobalLogger } from "@logger";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import { AppModule } from "./app.module";
import { ApiModule } from "./apps/api";
import { YoutubeApiModule } from "./apps/youtube-api";

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
  const options = { auth: { jwt: { secret: "secret" } } } as any;

  const api = await NestFactory.create(ApiModule.forRoot(options), new FastifyAdapter());
  const youtubeApi = await NestFactory.create(
    YoutubeApiModule.forRoot(options),
    new FastifyAdapter(),
  );

  const auth = { type: "http", scheme: "bearer", bearerFormat: "JWT" } as const;

  // get cwd package.json
  const { default: pkg } = await import("../../../package.json");
  const version = pkg.version;

  const apiOptions = new DocumentBuilder()
    .setTitle("API")
    .setDescription("Documentation for the core API")
    .setVersion(version)
    .addBearerAuth(auth, "AccessToken")
    .build();

  const youtubeApiOptions = new DocumentBuilder()
    .setTitle("Youtube API")
    .setDescription("Documentation for the Youtube API")
    .setVersion(version)
    .addBearerAuth(auth, "AccessToken")
    .build();

  const apiDocument = SwaggerModule.createDocument(api, apiOptions);
  const youtubeApiDocument = SwaggerModule.createDocument(youtubeApi, youtubeApiOptions);

  await mkdir(docPath, { recursive: true });
  await writeFile(join(docPath, "api.json"), JSON.stringify(apiDocument));
  await writeFile(join(docPath, "youtube-api.json"), JSON.stringify(youtubeApiDocument));

  api.close();
  youtubeApi.close();
}

if (process.env.DOC_PATH) {
  generateDocs(process.env.DOC_PATH);
} else {
  bootstrap();
}
