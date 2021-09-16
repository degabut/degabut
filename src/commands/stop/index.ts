import { Command } from "discord.js";

const command: Command = {
	name: "stop",
	aliases: ["disconnect"],
	description: "Stop playing song",
	async execute(message) {
		const queue = message.guild?.queue;
		if (!queue) return;

		queue.stop();

		message.react("👌🏻");
	},
};

export default command;
