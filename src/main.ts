import { ConfigUtil } from "@common/config";
import { GlobalLogger } from "@logger/global-logger.service";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

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

bootstrap();
