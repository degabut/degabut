import { GuildMember, InteractionCommand, TextChannel } from "discord.js";
import { inSameVoiceChannel } from "../../middlewares";
import { getQueue } from "../../utils";

const command: InteractionCommand<{ buttonInteractionMeta: string }> = {
	name: "search",
	description: "Search for a song",
	middlewares: [inSameVoiceChannel],
	buttonInteractionIdParser: (customId) => {
		const [, videoId] = customId.split("/");
		return videoId;
	},
	async execute(interaction, videoId, queue) {
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
