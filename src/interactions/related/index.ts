import { GuildMember, InteractionCommand, TextChannel } from "discord.js";
import { inSameVoiceChannel } from "../../middlewares";
import { hasQueue } from "../../middlewares/hasQueue";
import { getQueue } from "../../utils";

const command: InteractionCommand<{ buttonInteractionMeta: string }> = {
	name: "related",
	description: "Play related song",
	buttonInteractionIdParser: (customId) => {
		const [, videoId] = customId.split("/");
		return videoId;
	},
	middlewares: [hasQueue, inSameVoiceChannel],
	execute: async (interaction, videoId, queue) => {
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
