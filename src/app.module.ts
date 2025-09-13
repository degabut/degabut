import { WebSocketAdapter } from "@common/adapters";
import { IConfig } from "@common/config";
import { GlobalLogger } from "@logger/global-logger.service";
import { LoggerModule } from "@logger/logger.module";
import { Logger } from "@logger/logger.service";
import { DynamicModule, Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

@Module({})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(AppModule.name);
  }

  static forRoot(config: IConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({ load: [() => ({ main: config })] }),
        LoggerModule.forRoot({ appId: "bootstrap", ...config.logging }),
      ],
    };
  }

  async onModuleInit() {
    // config
    const config = this.configService.getOrThrow<IConfig>("main");

    if (config.logging?.printConfig) this.logger.info({ config });

    const { bot, youtubeApi } = config.apps;

    let isStandaloneYoutubeApi = true;
    // bots initialization
    if (bot) {
      if (youtubeApi) {
        if (!youtubeApi.port || youtubeApi.port === bot.http?.port) isStandaloneYoutubeApi = false;
      }

      await this.initMainApp({
        ...config,
        apps: {
          bot: config.apps.bot,
          youtubeApi: !isStandaloneYoutubeApi ? config.apps.youtubeApi : undefined,
        },
      });
    }

    // youtube api initialization
    if (isStandaloneYoutubeApi && youtubeApi) {
      await this.initYoutube(config);
    }
  }

  private async initMainApp(config: IConfig) {
    const { MainModule } = await import("./apps/main/main.module");
    const { FastifyAdapter } = await import("@nestjs/platform-fastify");

    const bot = config.apps.bot;
    if (!bot) return;

    const app = await NestFactory.create(MainModule.forRoot(config), new FastifyAdapter(), {
      bufferLogs: true,
      cors: process.env.NODE_ENV === "development",
    });

    app.useLogger(app.get(GlobalLogger));

    if (bot.ws) {
      const port = bot.ws.port === bot.http?.port ? 0 : bot.ws.port;
      if (port !== undefined) {
        app.useWebSocketAdapter(new WebSocketAdapter(app, port, bot.ws.path));
      }
    }

    if (bot.http) await app.listen(+bot.http.port, "0.0.0.0");
    else await app.init();
  }

  private async initYoutube(config: IConfig) {
    const { YoutubeApiModule } = await import("./apps/youtube-api/youtube-api.module");
    const { FastifyAdapter } = await import("@nestjs/platform-fastify");

    if (!config.auth?.jwt || !config.apps.youtubeApi?.port) return;

    const app = await NestFactory.create(YoutubeApiModule.forRoot(config), new FastifyAdapter(), {
      bufferLogs: true,
      cors: process.env.NODE_ENV === "development",
    });

    app.useLogger(app.get(GlobalLogger));

    await app.listen(+config.apps.youtubeApi.port, "0.0.0.0");
  }
}
