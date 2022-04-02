import { DiscordClient } from "@modules/discord/DiscordClient";
import dotenv from "dotenv";
import { container } from "tsyringe";
import { Config, ConfigProps } from "../core";
import { createApi } from "./api/api";
import {
	registerDiscordModules,
	registerLyricModules,
	registerQueueModules,
	registerYoutubeModules,
} from "./di";
import { initDiscord } from "./discord/discord";

export const run = (): void => {
	//#region Config
	dotenv.config();

	const config: ConfigProps = {
		prefix: process.env.PREFIX as string,
		token: process.env.TOKEN as string,
		apiServer: process.env.API_SERVER === "true",
		jwtSecret: process.env.JWT_SECRET,
		discordOAuthClientId: process.env.DISCORD_OAUTH_CLIENT_ID,
		discordOAuthClientSecret: process.env.DISCORD_OAUTH_CLIENT_SECRET,
		discordOAuthRedirectUri: process.env.DISCORD_OAUTH_REDIRECT_URI,
	};

	container.register(Config, { useValue: new Config(config) });
	//#endregion

	//#region Clients
	const discordClient = new DiscordClient();
	container.register(DiscordClient, { useValue: discordClient });
	discordClient.login(config.token);
	//#endregion

	//#region Modules DI
	registerQueueModules();
	registerYoutubeModules();
	registerLyricModules();
	registerDiscordModules({
		botToken: config.token,
		clientId: config.discordOAuthClientId,
		clientSecret: config.discordOAuthClientSecret,
		redirectUri: config.discordOAuthRedirectUri,
	});
	//#endregion

	//#region Api
	if (config.apiServer) {
		const api = createApi();
		api.listen(8080);
	}
	//#endregion

	//#region Discord
	initDiscord(discordClient, config.prefix);
	//#endregion
};
