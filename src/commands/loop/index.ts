import { RepeatMode } from "discord-music-player";
import { Command } from "discord.js";
import { getRepeatStateMessage } from "../../utils/Utils";

const command: Command = {
	name: "loop",
	description: "Loop Queue",
	async execute(message) {
		const queue = message.guild?.queue;
		if (!queue) return;

		let repeatMode = RepeatMode.SONG;
		if (queue.repeatMode === repeatMode) repeatMode = RepeatMode.DISABLED;

		queue.setRepeatMode(repeatMode);

		message.reply(getRepeatStateMessage(queue.repeatMode));
	},
};

export default command;
