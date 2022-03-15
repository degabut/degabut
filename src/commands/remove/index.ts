import { Command } from "discord.js";
import { hasQueue, inSameVoiceChannel } from "../../middlewares";

const command: Command<{ hasQueue: true }> = {
	name: "remove",
	description: "Remove a song from queue",
	middlewares: [hasQueue, inSameVoiceChannel],
	async execute(message, args, queue) {
		const index = +(args.shift() || queue.tracks.length) - 1;

		const removed = queue.remove(index);

		if (removed) await message.reply(`🚮 **${removed.title} removed from queue**`);
		else await message.reply("Invalid index!");
	},
};

export default command;
