import { ApiModule } from "@api/api.module";
import { AuthModule } from "@auth/auth.module";
import { IBotConfig, IGlobalConfig } from "@common/config";
import { DatabaseModule } from "@database/database.module";
import { EventsModule } from "@events/events.module";
import { HistoryModule } from "@history/history.module";
import { LoggerModule } from "@logger/logger.module";
import { Logger } from "@logger/logger.service";
import { DynamicModule, Module, Provider } from "@nestjs/common";
import { DiscoveryModule, DiscoveryService } from "@nestjs/core";
import { CqrsModule } from "@nestjs/cqrs";
import { PlaylistModule } from "@playlist/playlist.module";
import { QueuePlayerModule } from "@queue-player/queue-player.module";
import { QueueModule } from "@queue/queue.module";
import { SpotifyModule } from "@spotify/spotify.module";
import { UserModule } from "@user/user.module";
import { YoutubeModule } from "@youtube/youtube.module";
import { Client, GatewayIntentBits } from "discord.js";
import { NecordModule } from "necord";

import { DiscordCommands } from "./commands";
import { DiscordBotGateway } from "./discord-bot.gateway";
import { Explorers, TextCommandExplorer } from "./explorers";
import { ButtonInteractions, Interactions } from "./interactions";

@Module({
  imports: [CqrsModule, DiscoveryModule],
  providers: [
    DiscordBotGateway,
    ...Explorers,
    ...DiscordCommands,
    ...Interactions,
    ...ButtonInteractions,
  ],
})
export class DiscordBotModule {
  static forRoot(config: IBotConfig & IGlobalConfig): DynamicModule {
    const imports = [
      LoggerModule.forRoot({ appId: "bot", ...config.logging }),
      DatabaseModule.forRoot(config.postgres),
      QueuePlayerModule.forRoot(config.lavalink),
      SpotifyModule.forRoot(config.spotify),
      YoutubeModule.forRoot(config.youtubeApi || config.youtube),
      NecordModule.forRoot({
        token: config.token,
        prefix: config.prefix,
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
          return new TextCommandExplorer(config.prefix, discoveryService, client, logger);
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
      if (config.http) imports.push(ApiModule);
      if (config.ws) imports.push(EventsModule);
    }

    return {
      module: DiscordBotModule,
      providers,
      imports,
    };
  }
}
