import { Client as DiscordClient, Intents } from "discord.js";
import { inject, injectable } from "tsyringe";
import { OnInteractHandler, OnMessageHandler } from "./handlers";

@injectable()
export class Bot extends DiscordClient {
	constructor(
		@inject(OnMessageHandler) onMessageHandler: OnMessageHandler,
		@inject(OnInteractHandler) onInteractHandler: OnInteractHandler
	) {
		super({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_VOICE_STATES,
				Intents.FLAGS.DIRECT_MESSAGES,
			],
		});

		this.once("ready", () => console.log("Ready!"));
		this.on("messageCreate", (message) => onMessageHandler.execute(message));
		this.on("interactionCreate", (interaction) => onInteractHandler.execute(interaction));
	}
}
