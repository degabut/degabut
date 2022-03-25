import { Config } from "@core";
import { Client, Intents } from "discord.js";
import { container, injectable } from "tsyringe";
import { ICommand, IInteractionCommand } from "./core";
import { OnInteractHandler, OnMessageHandler } from "./handlers";

@injectable()
export class DiscordClient extends Client {
	constructor() {
		super({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_VOICE_STATES,
				Intents.FLAGS.DIRECT_MESSAGES,
			],
		});

		const commands = container.resolveAll<ICommand>("commands");
		const interactionCommands = container.resolveAll<IInteractionCommand>("interactionCommands");
		const { prefix } = container.resolve(Config);

		const onMessageHandler = new OnMessageHandler(commands, prefix);
		const onInteractHandler = new OnInteractHandler(interactionCommands);

		this.once("ready", () => console.log("Ready!"));
		this.on("messageCreate", (message) => onMessageHandler.execute(message));
		this.on("interactionCreate", (interaction) => onInteractHandler.execute(interaction));
	}
}
