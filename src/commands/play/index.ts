import { Command, TextChannel } from "discord.js";
import { inSameVoiceChannel } from "../../middlewares";
import { getQueue } from "../../utils";

const command: Command = {
	name: "play",
	description: "Play a song",
	aliases: ["p"],
	middlewares: [inSameVoiceChannel],
	async execute(message, args, queue) {
		if (!message.guild?.id || !message.member || !(message.channel instanceof TextChannel)) return;
		const keyword = args.join(" ");

		if (!queue) queue = await getQueue(message.member, message.channel);
		if (!queue) return;

		await queue.add({ keyword, author: message.member });
	},
};

export default command;
