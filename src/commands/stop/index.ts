import { Command } from "discord.js";
import { inSameVoiceChannel } from "../../middlewares";
import { hasQueue } from "../../middlewares/hasQueue";
import { queues } from "../../shared";

const command: Command<{ hasQueue: true }> = {
	name: "stop",
	aliases: ["disconnect", "dc"],
	description: "Disconnects the bot from voice channel",
	middlewares: [hasQueue, inSameVoiceChannel],
	async execute(message, _, queue) {
		queue.stop();
		queues.delete(message.guild?.id || "");
		await message.react("👋🏻");
	},
};

export default command;
