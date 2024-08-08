import { WebSocketAdapter } from "@common/adapters";
import { IBotConfig, IConfig, IGlobalConfig, IYoutubeApiConfig } from "@common/config";
import { GlobalLogger, Logger, LoggerModule } from "@logger";
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
        LoggerModule.forRoot({ appId: "main", ...config.logging }),
      ],
    };
  }

  async onModuleInit() {
    // config
    const config = this.configService.getOrThrow<IConfig>("main");

    if (config.logging?.printConfig) this.logger.info({ config });

    const { apps, ...globalConfig } = config;
    const { bot, youtubeApi } = apps;

    // bots initialization
    if (bot) await this.initBot({ ...bot, ...globalConfig });

    // youtube api initialization
    if (youtubeApi) await this.initYoutube({ ...youtubeApi, ...globalConfig });
  }

  private async initBot(config: IBotConfig & IGlobalConfig) {
    const { DiscordBotModule } = await import("./apps/discord-bot/discord-bot.module");
    const { FastifyAdapter } = await import("@nestjs/platform-fastify");

    const app = await NestFactory.create(DiscordBotModule.forRoot(config), new FastifyAdapter(), {
      bufferLogs: true,
      cors: process.env.NODE_ENV === "development",
    });

    app.useLogger(app.get(GlobalLogger));

    if (config.ws) app.useWebSocketAdapter(new WebSocketAdapter(app, +config.ws.port));

    if (config.http) await app.listen(+config.http.port, "0.0.0.0");
    else await app.init();
  }

  private async initYoutube(config: IYoutubeApiConfig & IGlobalConfig) {
    const { YoutubeApiModule } = await import("./apps/youtube-api/youtube-api.module");
    const { FastifyAdapter } = await import("@nestjs/platform-fastify");

    if (!config.auth?.jwt) return;

    const app = await NestFactory.create(YoutubeApiModule.forRoot(config), new FastifyAdapter(), {
      bufferLogs: true,
      cors: process.env.NODE_ENV === "development",
    });

    app.useLogger(app.get(GlobalLogger));

    await app.listen(+config.port, "0.0.0.0");
  }
}
