import { AuthConfigService } from "@auth/config";
import { HttpService } from "@nestjs/axios";
import { Injectable, NotImplementedException } from "@nestjs/common";
import { APIUser, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v9";

export type DiscordOAuth2Response = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  scope: string;
};

@Injectable()
export class DiscordOAuthProvider {
  private readonly clientId?: string;
  private readonly clientSecret?: string;

  constructor(
    private readonly httpService: HttpService,
    config: AuthConfigService,
  ) {
    this.clientId = config?.discordOAuth?.clientId;
    this.clientSecret = config?.discordOAuth?.clientSecret;
  }

  async getAccessToken(code: string, redirectUri?: string): Promise<DiscordOAuth2Response> {
    if (!this.clientId || !this.clientSecret) {
      throw new NotImplementedException("Discord OAuth is not configured");
    }

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    if (redirectUri) params.set("redirect_uri", redirectUri);

    const response = await this.httpService.axiosRef.post<RESTPostOAuth2AccessTokenResult>(
      "/oauth2/token",
      params,
    );

    return {
      accessToken: response.data.access_token,
      tokenType: response.data.token_type,
      expiresIn: response.data.expires_in,
      refreshToken: response.data.refresh_token,
      scope: response.data.scope,
    };
  }

  async getCurrentUser(accessToken: string): Promise<APIUser> {
    const response = await this.httpService.axiosRef.get<APIUser>("/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data;
  }
}
