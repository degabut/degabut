import { DiscordModule } from "@discord-nestjs/core";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";
import { CqrsModule } from "@nestjs/cqrs";
import { YoutubeModule } from "@youtube/youtube.module";
import { GatewayIntentBits } from "discord.js";

import { DiscordCommands } from "./commands";
import { DiscordBotConfigModule } from "./config";
import { DiscordBotGateway } from "./discord-bot.gateway";
import { Explorers } from "./explorers";
import { Interactions } from "./interactions";

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
            GatewayIntentBits.GuildMembers,
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
  providers: [DiscordBotGateway, ...Explorers, ...DiscordCommands, ...Interactions],
  exports: [DiscordModule],
})
export class DiscordBotModule {}
