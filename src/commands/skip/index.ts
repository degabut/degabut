import { Command } from "discord.js";

const command: Command = {
	name: "skip",
	description: "Skip currently playing song",
	async execute(message) {
		const queue = message.guild?.queue;
		if (!queue) return;

		if (!queue.nowPlaying) return message.reply("🤷‍♂ **Nothing to skip**");

		const song = queue.songs[1];
		queue.skip();
		message.reply("⏭ **Song skipped**");
		queue.onSongChanged(song);
	},
};

export default command;
