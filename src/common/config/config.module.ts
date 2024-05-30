import { Module } from "@nestjs/common";
import { ConfigService, ConfigModule as NestConfigModule } from "@nestjs/config";

import { ConfigUtil } from "./config.util";

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [async () => ({ main: await ConfigUtil.getConfig() })],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
