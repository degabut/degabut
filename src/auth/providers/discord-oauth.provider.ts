import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APIUser, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v9";

@Injectable()
export class DiscordOAuthProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly botToken: string;

  constructor(
    private readonly httpService: HttpService,

    configService: ConfigService,
  ) {
    const config = configService.getOrThrow<any>("discord-oauth");

    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.botToken = config.botToken;
  }

  async getAccessToken(code: string, redirectUri: string): Promise<string> {
    const response = await this.httpService.axiosRef.post<RESTPostOAuth2AccessTokenResult>(
      "/oauth2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
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
}
