import { Command } from "discord.js";
import { inSameVoiceChannel } from "../../middlewares";
import { hasQueue } from "../../middlewares/hasQueue";

const command: Command<{ hasQueue: true }> = {
	name: "nowplaying",
	aliases: ["np"],
	description: "Show currently playing song",
	middlewares: [hasQueue, inSameVoiceChannel],
	async execute(message, _, queue) {
		const track = queue.nowPlaying;
		if (!track) return;

		await message.reply({ embeds: [track.embed] });
	},
};

export default command;
