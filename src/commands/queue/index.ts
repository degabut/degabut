import { Command, MessageEmbed } from "discord.js";

const command: Command = {
	name: "queue",
	description: "Show current queue",
	async execute(message, args) {
		const queue = message.guild?.queue;
		if (!queue) return;

		const page = +(args.shift() || 1) - 1;
		const perPage = 10;

		const start = page * perPage;
		const end = (page + 1) * perPage;

		const paginatedQueue = queue.songs.slice(start, end);

		const embed = new MessageEmbed({
			title: "Queue",
			description: `Showing page **${page + 1}** / **${Math.ceil(queue.songs.length / perPage)}**`,
			fields: paginatedQueue.map((song, index) => ({
				name: `${start + index + 1}. ${song.name}`,
				value: `${song.url}\r\nRequested by <@!${song.requestedBy?.id}>`,
			})),
		});

		message.reply({ embeds: [embed] });
	},
};

export default command;
