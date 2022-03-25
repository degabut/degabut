import * as discordModules from "@modules/discord";
import { DiscordOAuthProvider } from "@modules/discord";
import * as lyricModules from "@modules/lyric";
import { LyricProvider } from "@modules/lyric";
import * as queueModules from "@modules/queue";
import { QueueMemoryRepository } from "@modules/queue";
import * as youtubeModules from "@modules/youtube";
import { YoutubeProvider } from "@modules/youtube";
import dotenv from "dotenv";
import "reflect-metadata";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { Client as YoutubeClient } from "youtubei";
import { Config, ConfigProps, EventHandler, UseCase } from "../core";
import { Controller, createApi } from "./api";
import * as apiControllers from "./api/controllers";
import { DiscordClient, ICommand, IInteractionCommand } from "./discord";
import * as botCommands from "./discord/commands";
import * as botInteractions from "./discord/interactions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTokens = (modules: Record<string, any>): constructor<UseCase>[] => {
	return Object.values(modules).filter(
		(U) => U.prototype instanceof UseCase || U.prototype instanceof EventHandler
	);
};

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

	//#region Repository
	container.registerSingleton("QueueRepository", QueueMemoryRepository);
	//#endregion

	//#region Providers
	container.registerSingleton(YoutubeClient);
	container.registerSingleton(YoutubeProvider);
	container.registerSingleton(LyricProvider);

	if (config.apiServer) {
		const discordOAuthProvider = new DiscordOAuthProvider({
			botToken: config.token,
			clientId: config.discordOAuthClientId,
			clientSecret: config.discordOAuthClientSecret,
			redirectUri: config.discordOAuthRedirectUri,
		});
		container.register(DiscordOAuthProvider, { useValue: discordOAuthProvider });
	}
	//#endregion

	//#region Use Cases and Event Handlers
	getTokens(queueModules).forEach((U) => container.registerSingleton(U));
	getTokens(youtubeModules).forEach((U) => container.registerSingleton(U));
	getTokens(lyricModules).forEach((U) => container.registerSingleton(U));
	getTokens(discordModules).forEach((U) => container.registerSingleton(U));
	//#endregion

	//#region Bot
	Object.values(botCommands).forEach((C) => {
		container.registerSingleton<ICommand>("commands", C);
	});
	Object.values(botInteractions).forEach((C) => {
		container.registerSingleton<IInteractionCommand>("interactionCommands", C);
	});

	const discordClient = new DiscordClient();
	discordClient.login(config.token);
	container.register(DiscordClient, { useValue: discordClient });
	//#endregion

	//#region Api
	if (config.apiServer) {
		Object.values(apiControllers).forEach((C) => {
			container.registerSingleton<Controller>("controllers", C);
		});
		const api = createApi();
		api.listen(8080);
	}
	//#endregion
};
