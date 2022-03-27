import { Client, Intents } from "discord.js";

// TODO where to put this

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
		this.once("ready", () => console.log("Ready!"));
	}
}
