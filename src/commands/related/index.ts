import { Command, GuildMember, MessageActionRow, MessageEmbed, TextChannel } from "discord.js";
import { VideoCompact } from "youtubei";
import { youtube } from "../../shared";
import { getQueue, videoToEmbedField, videoToMessageButton } from "../../utils";

const command: Command<string> = {
	name: "related",
	description: "Show songs related to the current song",
	buttonInteractionIdPrefix: "related",
	buttonInteractionIdParser: (customId) => {
		const [, videoId] = customId.split("/");
		return videoId;
	},
	async execute(message) {
		const queue = message.queue;
		if (!queue) return;
		if (!queue.nowPlaying) return await message.reply("No song is playing");

		const video = await youtube.getVideo(queue.nowPlaying.id);
		if (!video) return;

		const relatedVideos = [video.upNext, ...video.related]
			.filter((v) => v instanceof VideoCompact)
			.slice(0, 10) as VideoCompact[];

		const buttons = relatedVideos.map((v, i) =>
			videoToMessageButton(v, i, this.buttonInteractionIdPrefix)
		);

		await message.reply({
			content: `⭐ **Songs related with ${queue.nowPlaying.title}**`,
			embeds: [new MessageEmbed({ fields: relatedVideos.map(videoToEmbedField) })],
			components: [
				new MessageActionRow({ components: buttons.slice(0, 5) }),
				new MessageActionRow({ components: buttons.slice(5, 10) }),
			],
		});
	},
	async buttonInteraction(interaction, videoId) {
		interaction.deferUpdate();
		if (
			!(interaction.member instanceof GuildMember) ||
			!(interaction.channel instanceof TextChannel) ||
			!videoId
		)
			return;

		let queue = interaction.queue;
		if (!queue) queue = await getQueue(interaction.member, interaction.channel);
		if (!queue) return;

		queue.add({ id: videoId, author: interaction.member });
	},
};

export default command;
