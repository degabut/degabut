import {
	APIGuild,
	APIGuildMember,
	APIUser,
	RESTPostOAuth2AccessTokenResult,
} from "discord-api-types/v9";
import fetch, { RequestInit } from "node-fetch";

interface ConstructorOptions {
	clientId?: string;
	clientSecret?: string;
	redirectUri?: string;
	botToken?: string;
}

export class DiscordOAuthProvider {
	private clientId: string;
	private clientSecret: string;
	private redirectUri: string;
	private botToken: string;

	constructor({ clientId, clientSecret, botToken, redirectUri }: ConstructorOptions) {
		if (!clientId || !clientSecret || !botToken || !redirectUri)
			throw new Error("Invalid Discord credentials.");

		this.clientId = clientId;
		this.clientSecret = clientSecret;
		this.redirectUri = redirectUri;
		this.botToken = botToken;
	}

	async getAccessToken(code: string): Promise<string | undefined> {
		const response = await this.fetch("/oauth2/token", {
			method: "POST",
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code,
				client_id: this.clientId,
				client_secret: this.clientSecret,
				redirect_uri: this.redirectUri,
			}),
		});

		const { access_token: accessToken }: RESTPostOAuth2AccessTokenResult = await response.json();

		return accessToken;
	}

	async getCurrentUser(accessToken: string): Promise<APIUser | undefined> {
		const response = await this.fetch("/users/@me", {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return response.status === 200 ? await response.json() : undefined;
	}

	async getCurrentUserGuilds(accessToken: string): Promise<APIGuild[]> {
		const response = await this.fetch("/users/@me/guilds", {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		return await response.json();
	}

	async getGuildMember(guildId: string, userId: string): Promise<APIGuildMember | undefined> {
		const response = await this.fetch(`/guilds/${guildId}/members/${userId}`, {
			headers: { Authorization: `Bot ${this.botToken}` },
		});
		return await response.json();
	}

	private fetch(url: string, options: RequestInit) {
		return fetch("https://discord.com/api/v9" + url, options);
	}
}
