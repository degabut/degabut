import { ILoggerConfig } from "@common/config";
import { DynamicModule, Module, Scope } from "@nestjs/common";
import { PARAMS_PROVIDER_TOKEN, Params, LoggerModule as PinoLoggerModule } from "nestjs-pino";
import { TransportTargetOptions } from "pino";
import { PrettyOptions } from "pino-pretty";

import { GlobalLogger } from "./global-logger.service";
import { Logger } from "./logger.service";

export type LoggingConfig = {
  appId: string;
} & ILoggerConfig;

@Module({})
export class LoggerModule {
  static forRoot(config: LoggingConfig): DynamicModule {
    const targets: TransportTargetOptions[] = [];

    if (config.file) {
      targets.push({
        target: "pino/file",
        options: {
          destination: config.file.path,
          mkdir: true,
          minLength: config.file.minLength,
        },
      });
    }

    if (config.pretty) {
      targets.push({
        target: "pino-pretty",
        options: {
          singleLine: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
        } as PrettyOptions,
      });
    } else {
      targets.push({
        target: "pino/file",
      });
    }

    return {
      global: true,
      module: LoggerModule,
      imports: [
        PinoLoggerModule.forRoot({
          pinoHttp: {
            level: config.level || "info",
            transport: {
              targets,
            },
          },
        }),
      ],
      providers: [
        {
          provide: Logger,
          inject: [PARAMS_PROVIDER_TOKEN],
          useFactory: (params: Params) => new Logger(config.appId, params),
          scope: Scope.TRANSIENT,
        },
        {
          provide: GlobalLogger,
          inject: [PARAMS_PROVIDER_TOKEN],
          useFactory: (params: Params) => new GlobalLogger(config.appId, params),
          scope: Scope.DEFAULT,
        },
      ],
      exports: [Logger, GlobalLogger],
    };
  }
}
