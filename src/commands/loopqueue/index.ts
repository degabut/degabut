import { Command } from "discord.js";
import { inSameVoiceChannel } from "../../middlewares";
import { hasQueue } from "../../middlewares/hasQueue";

const command: Command<{ hasQueue: true }> = {
	name: "loopqueue",
	description: "Loop Queue",
	middlewares: [hasQueue, inSameVoiceChannel],
	async execute(message, _, queue) {
		const isLooped = queue.toggleLoopQueue();
		await message.reply(isLooped ? "🔂 **Looping Queue**" : "▶ **Loop Queue Disabled**");
	},
};

export default command;
