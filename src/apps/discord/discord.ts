import { DiscordClient } from "@modules/discord/DiscordClient";
import { container } from "tsyringe";
import * as commands from "./commands";
import { ICommand } from "./core/ICommand";
import { IInteractionCommand } from "./core/IInteractionCommand";
import { OnInteractHandler } from "./handlers/OnInteractHandler";
import { OnMessageHandler } from "./handlers/OnMessageHandler";
import * as interactions from "./interactions";

export const initDiscord = (client: DiscordClient, prefix: string): void => {
	const Commands = Object.values(commands).map((C) => container.resolve<ICommand>(C));
	const InteractionCommands = Object.values(interactions).map((I) =>
		container.resolve<IInteractionCommand>(I)
	);

	const onMessageHandler = new OnMessageHandler(Commands, prefix);
	const onInteractHandler = new OnInteractHandler(InteractionCommands);

	client.on("messageCreate", (message) => onMessageHandler.execute(message));
	client.on("interactionCreate", (interaction) => onInteractHandler.execute(interaction));
};
