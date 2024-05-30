import { HttpModule } from "@nestjs/axios";
import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { Commands } from "./commands";
import { AuthConfigProp, AuthConfigService } from "./config";
import { DiscordOAuthProvider, JwtAuthProvider } from "./providers";

@Module({
  imports: [HttpModule.register({ baseURL: "https://discord.com/api/v9" })],
  providers: [DiscordOAuthProvider, JwtAuthProvider, AuthConfigService, ConfigService, ...Commands],
  exports: [JwtAuthProvider],
})
export class AuthModule {
  static forRoot(config: AuthConfigProp): DynamicModule {
    return {
      global: true,
      module: AuthModule,
      imports: [ConfigModule.forRoot({ load: [() => config] })],
    };
  }
}
