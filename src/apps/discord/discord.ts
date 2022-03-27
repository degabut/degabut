import { DiscordClient } from "@modules/discord";
import { container } from "tsyringe";
import { ICommand, IInteractionCommand } from "./core";
import { OnInteractHandler, OnMessageHandler } from "./handlers";

export const initDiscord = (client: DiscordClient, prefix: string): void => {
	const commands = container.resolveAll<ICommand>("commands");
	const interactionCommands = container.resolveAll<IInteractionCommand>("interactionCommands");

	const onMessageHandler = new OnMessageHandler(commands, prefix);
	const onInteractHandler = new OnInteractHandler(interactionCommands);

	client.on("messageCreate", (message) => onMessageHandler.execute(message));
	client.on("interactionCreate", (interaction) => onInteractHandler.execute(interaction));
};
