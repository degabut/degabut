import { DiscordClient } from "@modules/discord/DiscordClient";
import dotenv from "dotenv";
import Knex from "knex";
import { Model } from "objection";
import { container } from "tsyringe";
import { Config, ConfigProps } from "../core";
import { createApi } from "./api/api";
import {
	registerDiscordModules,
	registerLyricModules,
	registerQueueModules,
	registerUserModules,
	registerYoutubeModules,
} from "./di";
import { initDiscord } from "./discord/discord";

export const run = async (): Promise<void> => {
	//#region Config
	dotenv.config();

	const config: ConfigProps = {
		prefix: process.env.PREFIX as string,
		token: process.env.TOKEN as string,
		env: process.env.NODE_ENV as "development" | "production",
		apiServer: process.env.API_SERVER === "true",
		jwtSecret: process.env.JWT_SECRET,
		discordOAuthClientId: process.env.DISCORD_OAUTH_CLIENT_ID,
		discordOAuthClientSecret: process.env.DISCORD_OAUTH_CLIENT_SECRET,
		discordOAuthRedirectUri: process.env.DISCORD_OAUTH_REDIRECT_URI,
		postgresDatabaseUrl: process.env.POSTGRES_DATABASE_URL,
	};

	container.register(Config, { useValue: new Config(config) });
	//#endregion

	//#region Clients
	const discordClient = new DiscordClient();
	container.register(DiscordClient, { useValue: discordClient });
	discordClient.login(config.token);
	//#endregion

	//region Db
	const knex = Knex({
		client: "pg",
		connection: config.postgresDatabaseUrl,
	});
	Model.knex(knex);
	container.register("knex", { useValue: knex });
	//#endregion

	//#region Modules DI
	registerQueueModules();
	registerYoutubeModules();
	registerUserModules();
	registerLyricModules();
	registerDiscordModules(
		config.apiServer
			? {
					botToken: config.token,
					clientId: config.discordOAuthClientId,
					clientSecret: config.discordOAuthClientSecret,
					redirectUri: config.discordOAuthRedirectUri,
			  }
			: undefined
	);
	//#endregion

	//#region Api
	if (config.apiServer) {
		const api = createApi(config);
		api.listen(8080, "0.0.0.0", (_, address) => {
			console.log(`API Ready (${address})`);
		});
	}
	//#endregion

	//#region Discord
	initDiscord(discordClient, config.prefix);
	//#endregion
};
