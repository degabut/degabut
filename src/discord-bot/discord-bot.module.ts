import { DiscordModule, Once } from "@discord-nestjs/core";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";
import { CqrsModule } from "@nestjs/cqrs";
import { YoutubeModule } from "@youtube/youtube.module";
import { GatewayIntentBits } from "discord.js";

import { Commands } from "./commands";
import { DiscordBotConfigModule } from "./config";
import { Explorers } from "./explorers";
import { Interactions } from "./interactions";
import { Listeners } from "./listeners";
import { PrefixCommands } from "./prefix-commands";
import { PlayerRepository } from "./repositories";
import { DiscordBotService, DiscordPlayerService } from "./services";

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    DiscoveryModule,
    DiscordBotConfigModule,
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.getOrThrow("discord-bot.token"),
        discordClientOptions: {
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent,
          ],
        },
        failOnLogin: true,
      }),
    }),
    YoutubeModule,
  ],
  providers: [
    DiscordBotService,
    DiscordPlayerService,
    PlayerRepository,
    ...Explorers,
    ...Commands,
    ...PrefixCommands,
    ...Interactions,
    ...Listeners,
  ],
  exports: [DiscordModule, DiscordBotService, DiscordPlayerService],
})
export class DiscordBotModule {
  private readonly logger = new Logger(DiscordBotModule.name);

  @Once("ready")
  onReady() {
    this.logger.log("Discord bot ready");
  }
}
