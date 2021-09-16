import { Command } from "discord.js";
import { getEmbedFromSong } from "../../utils/Utils";

const command: Command = {
	name: "np",
	aliases: ["nowplaying"],
	description: "Show currently playing song",
	async execute(message) {
		const queue = message.guild?.queue;
		if (!queue) return;

		const song = queue.nowPlaying;

		message.reply({ embeds: [getEmbedFromSong(song, queue.createProgressBar().prettier)] });
	},
};

export default command;
