import { Command } from "discord.js";
import { inSameVoiceChannel } from "../../middlewares";
import { hasQueue } from "../../middlewares/hasQueue";

const command: Command<{ hasQueue: true }> = {
	name: "loop",
	description: "Loop Queue",
	middlewares: [hasQueue, inSameVoiceChannel],
	async execute(message, _, queue) {
		const isLooped = queue.toggleLoopSong();
		await message.reply(isLooped ? "🔂 **Looping Song**" : "▶ **Loop Song Disabled**");
	},
};

export default command;
