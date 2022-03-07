import { Command } from "discord.js";

const command: Command = {
	name: "skip",
	description: "Skip now playing song",
	async execute(message) {
		const queue = message.queue;
		if (!queue) return;
		queue.skip();
	},
};

export default command;
