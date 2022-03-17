import { Command, MessageActionRow, MessageEmbed } from "discord.js";
import { VideoCompact } from "youtubei";
import relatedInteraction from "../../interactions/related";
import { inSameVoiceChannel } from "../../middlewares";
import { hasQueue } from "../../middlewares/hasQueue";
import { youtube } from "../../shared";
import { videoToEmbedField, videoToMessageButton } from "../../utils";

const command: Command<{ hasQueue: true }> = {
	name: "related",
	description: "Show songs related to the current song",
	middlewares: [hasQueue, inSameVoiceChannel],
	async execute(message, _, queue) {
		const target = queue.nowPlaying || queue.history[0];
		if (!target) return await message.reply("No song is playing");

		const video = await youtube.getVideo(target.id);
		if (!video) return;

		const relatedVideos = [video.upNext, ...video.related]
			.filter((v) => v instanceof VideoCompact)
			.slice(0, 10) as VideoCompact[];

		const buttons = relatedVideos.map((v, i) =>
			videoToMessageButton(v, i, relatedInteraction.name)
		);

		await message.reply({
			content: `⭐ **Songs related with ${target.title}**`,
			embeds: [new MessageEmbed({ fields: relatedVideos.map(videoToEmbedField) })],
			components: [
				new MessageActionRow({ components: buttons.slice(0, 5) }),
				new MessageActionRow({ components: buttons.slice(5, 10) }),
			],
		});
	},
};

export default command;
