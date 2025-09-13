import { ApiModule } from "@api/api.module";
import { AuthModule } from "@auth/auth.module";
import { IConfig } from "@common/config";
import { DatabaseModule } from "@database/database.module";
import { EventsModule } from "@events/events.module";
import { HistoryModule } from "@history/history.module";
import { LoggerModule } from "@logger/logger.module";
import { Logger } from "@logger/logger.service";
import { DynamicModule, Module, Provider } from "@nestjs/common";
import { DiscoveryModule, DiscoveryService, RouterModule, Routes } from "@nestjs/core";
import { CqrsModule } from "@nestjs/cqrs";
import { PlaylistModule } from "@playlist/playlist.module";
import { QueuePlayerModule } from "@queue-player/queue-player.module";
import { QueueModule } from "@queue/queue.module";
import { SpotifyModule } from "@spotify/spotify.module";
import { UserModule } from "@user/user.module";
import { YoutubeApiModule } from "@youtube-api/youtube-api.module";
import { YoutubeModule } from "@youtube/youtube.module";
import { Client, GatewayIntentBits } from "discord.js";
import { NecordModule } from "necord";

import { DiscordCommands } from "./commands";
import { DiscordBotGateway } from "./discord-bot.gateway";
import { DiscordBotService } from "./discord-bot.service";
import { Explorers, TextCommandExplorer } from "./explorers";
import { ButtonInteractions, Interactions } from "./interactions";

@Module({
  imports: [CqrsModule, DiscoveryModule],
  providers: [
    DiscordBotGateway,
    DiscordBotService,
    ...Explorers,
    ...DiscordCommands,
    ...Interactions,
    ...ButtonInteractions,
  ],
})
export class MainModule {
  // private destroy$ = new Subject<void>();

  // constructor(
  //   private readonly logger: Logger,
  //   private readonly eventBus: EventBus,
  //   private readonly commandBus: CommandBus,
  //   private readonly queryBus: QueryBus,
  // ) {
  //   this.eventBus.pipe(takeUntil(this.destroy$)).subscribe((event) => {
  //     this.logger.info({ event });
  //   });
  //   this.commandBus.pipe(takeUntil(this.destroy$)).subscribe((command) => {
  //     this.logger.info({ command });
  //   });
  //   this.queryBus.pipe(takeUntil(this.destroy$)).subscribe((query) => {
  //     this.logger.info({ query });
  //   });
  // }

  // onModuleDestroy() {
  //   this.destroy$.next();
  //   this.destroy$.complete();
  // }

  static forRoot(config: IConfig): DynamicModule {
    const bot = config.apps.bot;
    if (!bot) throw new Error("Bot configuration is missing");

    const imports = [
      LoggerModule.forRoot({ appId: "main", ...config.logging }),
      DatabaseModule.forRoot(config.postgres),
      QueuePlayerModule.forRoot(config.lavalink),
      SpotifyModule.forRoot(config.spotify),
      YoutubeModule.forRoot(config.youtubeApi || config.youtube),
      NecordModule.forRoot({
        token: bot.token,
        prefix: bot.prefix,
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildMessageReactions,
          GatewayIntentBits.MessageContent,
        ],
      }),
      HistoryModule,
      PlaylistModule,
      QueueModule,
      UserModule,
    ];

    const providers: Provider[] = [
      {
        provide: TextCommandExplorer,
        inject: [DiscoveryService, Logger, Client],
        useFactory: (discoveryService: DiscoveryService, logger: Logger, client: Client) => {
          return new TextCommandExplorer(bot.prefix, discoveryService, client, logger);
        },
      },
    ];

    if (config.auth?.jwt) {
      imports.push(
        AuthModule.forRoot({
          discordOAuth: config.auth.discordOAuth,
          jwt: config.auth.jwt,
        }),
      );

      const routes: Routes = [];

      if (bot.http) {
        imports.push(ApiModule);
        if (bot.http.path) routes.push({ path: bot.http.path, module: ApiModule });
      }
      if (bot.ws) imports.push(EventsModule);

      const youtubeApi = config.apps.youtubeApi;
      if (youtubeApi) {
        imports.push(YoutubeApiModule.forRoot(config));
        if (youtubeApi.path) routes.push({ path: youtubeApi.path, module: YoutubeApiModule });
      }

      if (routes.length) imports.push(RouterModule.register(routes));
    }

    return {
      module: MainModule,
      providers,
      imports,
    };
  }
}
