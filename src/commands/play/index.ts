import { Command, TextChannel } from "discord.js";
import { getQueue } from "../../utils";

const command: Command = {
	name: "play",
	description: "Play a song",
	aliases: ["p"],
	async execute(message, args) {
		if (!message.guild?.id || !message.member || !(message.channel instanceof TextChannel)) return;
		const keyword = args.join(" ");

		let queue = message.queue;
		if (!queue) queue = await getQueue(message.member, message.channel);
		if (!queue) return;

		await queue.add({ keyword, author: message.member });
	},
};

export default command;
