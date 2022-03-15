import { Command, GuildMember, MessageActionRow, MessageEmbed, TextChannel } from "discord.js";
import { inSameVoiceChannel } from "../../middlewares";
import { youtube } from "../../shared";
import { getQueue, videoToEmbedField, videoToMessageButton } from "../../utils";

const command: Command<{ buttonInteractionMeta: string }> = {
	name: "search",
	aliases: ["s"],
	description: "Search for a song",
	buttonInteractionIdPrefix: "search",
	middlewares: [inSameVoiceChannel],
	buttonInteractionIdParser: (customId) => {
		const [, videoId] = customId.split("/");
		return videoId;
	},
	async execute(message, args) {
		const keyword = args.join("");

		const result = await youtube.search(keyword, { type: "video" });
		const videos = result.slice(0, 10);

		const buttons = videos.map((v, i) =>
			videoToMessageButton(v, i, this.buttonInteractionIdPrefix)
		);

		await message.reply({
			embeds: [new MessageEmbed({ fields: videos.map(videoToEmbedField) })],
			components: [
				new MessageActionRow({ components: buttons.slice(0, 5) }),
				new MessageActionRow({ components: buttons.slice(5, 10) }),
			],
		});
	},
	async buttonInteraction(interaction, videoId, queue) {
		await interaction.deferUpdate();
		if (
			!(interaction.member instanceof GuildMember) ||
			!(interaction.channel instanceof TextChannel) ||
			!videoId
		)
			return;

		if (!queue) queue = await getQueue(interaction.member, interaction.channel);
		if (!queue) return;

		queue.add({ id: videoId, author: interaction.member });
	},
};

export default command;
