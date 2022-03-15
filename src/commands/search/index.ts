import { Command, MessageActionRow, MessageEmbed } from "discord.js";
import searchInteraction from "../../interactions/search";
import { inSameVoiceChannel } from "../../middlewares";
import { youtube } from "../../shared";
import { videoToEmbedField, videoToMessageButton } from "../../utils";

const command: Command = {
	name: "search",
	aliases: ["s"],
	description: "Search for a song",
	middlewares: [inSameVoiceChannel],
	async execute(message, args) {
		const keyword = args.join("");

		const result = await youtube.search(keyword, { type: "video" });
		const videos = result.slice(0, 10);

		const buttons = videos.map((v, i) => videoToMessageButton(v, i, searchInteraction.name));

		await message.reply({
			embeds: [new MessageEmbed({ fields: videos.map(videoToEmbedField) })],
			components: [
				new MessageActionRow({ components: buttons.slice(0, 5) }),
				new MessageActionRow({ components: buttons.slice(5, 10) }),
			],
		});
	},
};

export default command;
