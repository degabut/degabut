import { Command } from "discord.js";

const command: Command = {
	name: "autoplay",
	description: "Toggle autoplay",
	async execute(message) {
		const queue = message.guild?.queue;
		if (!queue) return;

		queue.setAutoPlay(!queue.autoplay);

		message.reply(`🎧 Autoplay is now ${queue.autoplay ? "enabled" : "disabled"}`);
	},
};

export default command;
