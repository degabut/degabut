import { Command } from "discord.js";

const command: Command = {
	name: "autoplay",
	aliases: ["ap"],
	description: "Toggle autoplay",
	async execute(message) {
		const queue = message.queue;
		if (!queue) return;

		const isAutoplaying = queue.toggleAutoplay();
		message.reply(isAutoplaying ? "🎧 **Autoplay enabled**" : "▶ **Autoplay Disabled**");
	},
};

export default command;
