import { Command } from "discord.js";
import { queues } from "../../shared";

const command: Command = {
	name: "stop",
	aliases: ["disconnect", "dc"],
	description: "Disconnects the bot from voice channel",
	async execute(message) {
		const queue = message.queue;
		if (!queue) return;
		queue.stop();
		queues.delete(message.guild?.id || "");
		message.react("👋🏻");
	},
};

export default command;
