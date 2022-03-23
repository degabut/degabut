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
import { Config, ConfigProps, UseCase } from "../core";
import { Bot } from "./bot";
import * as commands from "./bot/commands";
import { ICommand, IInteractionCommand } from "./bot/core";
import { OnInteractHandler, OnMessageHandler } from "./bot/handlers";
import * as interactions from "./bot/interactions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUseCases = (modules: Record<string, any>): constructor<UseCase>[] => {
	return Object.values(modules).filter((U) => U.prototype instanceof UseCase);
};

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

	//#region Repository
	container.registerSingleton("QueueRepository", QueueMemoryRepository);
	//#endregion

	//#region Providers
	container.registerSingleton(YoutubeClient);
	container.registerSingleton(YoutubeProvider);
	container.registerSingleton(LyricProvider);
	//#endregion

	//#region Use Cases
	getUseCases(queueModules).forEach((U) => container.registerSingleton(U));
	getUseCases(youtubeModules).forEach((U) => container.registerSingleton(U));
	getUseCases(lyricModules).forEach((U) => container.registerSingleton(U));
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
