import { DiscordBotModule } from "@discord-bot/discord-bot.module";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DiscordOAuthConfigModule } from "./config";
import { DiscordOAuthProvider } from "./providers";
import { Queries } from "./queries";

@Module({
  imports: [
    ConfigModule,
    DiscordOAuthConfigModule,
    DiscordBotModule,
    HttpModule.register({
      baseURL: "https://discord.com/api/v9",
    }),
  ],
  providers: [DiscordOAuthProvider, ...Queries],
  exports: [DiscordOAuthProvider],
})
export class DiscordModule {}
