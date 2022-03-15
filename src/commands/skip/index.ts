import { Command } from "discord.js";
import { inSameVoiceChannel } from "../../middlewares";
import { hasQueue } from "../../middlewares/hasQueue";

const command: Command<{ hasQueue: true }> = {
	name: "skip",
	description: "Skip now playing song",
	middlewares: [hasQueue, inSameVoiceChannel],
	async execute(message, _, queue) {
		queue.skip();
	},
};

export default command;
