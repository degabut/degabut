import { Command } from "discord.js";
import { hasQueue, inSameVoiceChannel } from "../../middlewares";

const command: Command<{ hasQueue: true }> = {
	name: "autoplay",
	aliases: ["ap"],
	description: "Toggle autoplay",
	middlewares: [hasQueue, inSameVoiceChannel],
	async execute(message, _, queue) {
		const isAutoplaying = queue.toggleAutoplay();
		await message.reply(isAutoplaying ? "🎧 **Autoplay enabled**" : "▶ **Autoplay Disabled**");
	},
};

export default command;
