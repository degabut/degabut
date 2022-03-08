import { Command } from "discord.js";

const command: Command = {
	name: "nowplaying",
	aliases: ["np"],
	description: "Show currently playing song",
	async execute(message) {
		const queue = message.queue;
		if (!queue) return;

		const track = queue.nowPlaying;
		if (!track) return;

		message.reply({ embeds: [track.embed] });
	},
};

export default command;
