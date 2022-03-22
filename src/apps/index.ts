import { LyricProvider } from "@modules/lyric";
import * as lyricUseCases from "@modules/lyric/useCases";
import { QueueManager } from "@modules/queue";
import * as queueUseCases from "@modules/queue/useCases";
import { YoutubeProvider } from "@modules/youtube";
import * as youtubeUseCases from "@modules/youtube/useCases";
import dotenv from "dotenv";
import "reflect-metadata";
import { container } from "tsyringe";
import { Client as YoutubeClient } from "youtubei";
import { Config, ConfigProps, UseCase } from "../core";
import { Bot } from "./bot";
import * as commands from "./bot/commands";
import { ICommand, IInteractionCommand } from "./bot/core";
import { OnInteractHandler, OnMessageHandler } from "./bot/handlers";
import * as interactions from "./bot/interactions";

export const run = (): void => {
	//#region Config
	dotenv.config();

	const config: ConfigProps = {
		prefix: process.env.PREFIX as string,
		token: process.env.TOKEN as string,
		webSocketServer: process.env.WEBSOCKET_SERVER === "true",
		jwtSecret: process.env.JWT_SECRET,
	};

	container.register(Config, { useValue: new Config(config) });
	//#endregion

	//#region States
	// container.register(QueueManager, { useValue: new QueueManager() });
	container.registerSingleton(QueueManager);
	//#endregion

	//#region Providers
	container.registerSingleton(YoutubeClient);
	container.registerSingleton(YoutubeProvider);
	container.registerSingleton(LyricProvider);
	//#endregion

	//#region Use Cases
	Object.values(queueUseCases)
		.filter((U) => U.prototype instanceof UseCase)
		.forEach((U) => container.registerSingleton<UseCase>(U));

	Object.values(youtubeUseCases)
		.filter((U) => U.prototype instanceof UseCase)
		.forEach((U) => container.registerSingleton<UseCase>(U));

	Object.values(lyricUseCases)
		.filter((U) => U.prototype instanceof UseCase)
		.forEach((U) => container.registerSingleton<UseCase>(U));
	//#endregion

	//#region Bot
	Object.values(commands).forEach((C) => {
		container.registerSingleton<ICommand>("commands", C);
	});
	Object.values(interactions).forEach((C) => {
		container.registerSingleton<IInteractionCommand>("interactionCommands", C);
	});

	container.registerSingleton(OnMessageHandler);
	container.registerSingleton(OnInteractHandler);

	container.register(Bot, { useClass: Bot });
	//#endregion

	//#region start
	const bot = container.resolve(Bot);
	bot.login(config.token);
	//#endregion
};
