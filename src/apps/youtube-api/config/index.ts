import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type AuthConfigProp = {
  refreshToken?: string;
};

@Injectable()
export class YoutubeApiConfigService {
  constructor(private configService: ConfigService) {}

  get refreshToken() {
    return this.configService.get<string>("oauth.refreshToken");
  }
}
