import { IDiscordOAuthConfig, IJwtConfig } from "@common/config";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type AuthConfigProp = {
  jwt: IJwtConfig;
  discordOAuth?: IDiscordOAuthConfig;
};

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

  get jwt() {
    return this.configService.getOrThrow<IJwtConfig>("jwt");
  }

  get discordOAuth() {
    return this.configService.get<IDiscordOAuthConfig>("discordOAuth");
  }
}
