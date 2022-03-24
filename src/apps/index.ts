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
import { Bot } from "./bot";
import * as botCommands from "./bot/commands";
import { ICommand, IInteractionCommand } from "./bot/core";
import * as botInteractions from "./bot/interactions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUseCases = (modules: Record<string, any>): constructor<UseCase>[] => {
	return Object.values(modules).filter((U) => U.prototype instanceof UseCase);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getEventHandlers = (modules: Record<string, any>): constructor<EventHandler>[] => {
	return Object.values(modules).filter((E) => E.prototype instanceof EventHandler);
};

export const run = (): void => {
	//#region Config
	dotenv.config();

	const config: ConfigProps = {
		prefix: process.env.PREFIX as string,
		token: process.env.TOKEN as string,
		apiServer: process.env.API_SERVER === "true",
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

	//#region Event Handlers
	getEventHandlers(queueModules).forEach((U) => container.registerSingleton(U));
	//#endregion

	//#region Bot
	Object.values(botCommands).forEach((C) => {
		container.registerSingleton<ICommand>("commands", C);
	});
	Object.values(botInteractions).forEach((C) => {
		container.registerSingleton<IInteractionCommand>("interactionCommands", C);
	});

	const bot = new Bot();
	bot.login(config.token);
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
