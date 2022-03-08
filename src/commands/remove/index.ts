import { Command } from "discord.js";

const command: Command = {
	name: "remove",
	description: "Remove a song from queue",
	async execute(message, args) {
		const queue = message.queue;
		if (!queue) return;

		const index = +(args.shift() || queue.tracks.length) - 1;

		const removed = queue.remove(index);

		if (removed) message.channel.send(`🚮 **${removed.title} removed from queue**`);
		else message.channel.send("Invalid index!");
	},
};

export default command;
