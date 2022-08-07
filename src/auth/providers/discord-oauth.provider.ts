import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  APIGuild,
  APIGuildMember,
  APIUser,
  RESTPostOAuth2AccessTokenResult,
} from "discord-api-types/v9";

@Injectable()
export class DiscordOAuthProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly botToken: string;

  constructor(
    private readonly httpService: HttpService,

    configService: ConfigService,
  ) {
    const config = configService.getOrThrow<any>("discord-oauth");

    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.botToken = config.botToken;
  }

  async getAccessToken(code: string): Promise<string> {
    const response = await this.httpService.axiosRef.post<RESTPostOAuth2AccessTokenResult>(
      "/oauth2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    );

    return response.data.access_token;
  }

  async getCurrentUser(accessToken: string): Promise<APIUser> {
    const response = await this.httpService.axiosRef.get<APIUser>("/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data;
  }

  async getCurrentUserGuilds(accessToken: string): Promise<APIGuild[]> {
    const response = await this.httpService.axiosRef.get<APIGuild[]>("/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async getGuildMember(guildId: string, userId: string): Promise<APIGuildMember | undefined> {
    const response = await this.httpService.axiosRef.get<APIGuildMember>(
      `/guilds/${guildId}/members/${userId}`,
      {
        headers: { Authorization: `Bot ${this.botToken}` },
      },
    );
    return response.data;
  }
}
