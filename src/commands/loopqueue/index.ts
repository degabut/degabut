import { Command } from "discord.js";

const command: Command = {
	name: "loopqueue",
	description: "Loop Queue",
	async execute(message) {
		const queue = message.queue;
		if (!queue) return;

		const isLooped = queue.toggleLoopQueue();
		message.reply(isLooped ? "🔂 **Looping Queue**" : "▶ **Loop Queue Disabled**");
	},
};

export default command;
