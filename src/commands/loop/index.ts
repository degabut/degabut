import { Command } from "discord.js";

const command: Command = {
	name: "loop",
	description: "Loop Queue",
	async execute(message) {
		const queue = message.queue;
		if (!queue) return;

		const isLooped = queue.toggleLoopSong();
		message.reply(isLooped ? "🔂 **Looping Song**" : "▶ **Loop Song Disabled**");
	},
};

export default command;
