import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DiscordOAuthConfigModule, JwtAuthConfigModule } from "./config";
import { DiscordOAuthProvider, JwtAuthProvider } from "./providers";
import { Queries } from "./queries";

@Module({
  imports: [
    ConfigModule,
    JwtAuthConfigModule,
    DiscordOAuthConfigModule,
    HttpModule.register({
      baseURL: "https://discord.com/api/v9",
    }),
  ],
  providers: [DiscordOAuthProvider, JwtAuthProvider, ...Queries],
  exports: [JwtAuthProvider],
})
export class AuthModule {}
