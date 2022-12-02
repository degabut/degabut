import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";

import { LoggerConfigModule } from "./config";

@Module({
  imports: [
    LoggerConfigModule,
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          pinoHttp: {
            level: config.get("logger.level"),
            autoLogging: false,
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
