import { entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { EmbedField, GuildMember, MessageButton, TextChannel } from "discord.js";
import { Video, VideoCompact } from "youtubei";
import { Queue } from "../modules";
import { queues } from "../shared";

export const secondToTime = (seconds: number): string => {
	return new Date(seconds * 1000).toISOString().substring(11, 19).replace("-", ":");
};

export const getQueue = async (
	member: GuildMember,
	textChannel: TextChannel
): Promise<Queue | undefined> => {
	let queue = queues.get(member.guild.id);

	if (!queue && member.voice.channel) {
		const voiceChannel = member.voice.channel;
		queue = new Queue({
			voiceConnection: joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator,
			}),
			voiceChannel,
			textChannel,
		});
		queue.voiceConnection.on("error", console.warn);
		queues.set(member.guild.id, queue);
	}
	if (!queue) return;

	try {
		await entersState(queue.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
	} catch (error) {
		console.warn(error);
		return;
	}

	return queue;
};

const numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export const videoToMessageButton = (
	video: Video | VideoCompact,
	index: number,
	idPrefix?: string
): MessageButton => {
	return new MessageButton({
		customId: `${idPrefix}/${video.id}`,
		label: video.title.length < 20 ? video.title : video.title.substring(0, 20) + "...",
		style: "SUCCESS",
		emoji: numbers[index],
	});
};

export const videoToEmbedField = (video: Video | VideoCompact, index: number): EmbedField => {
	return {
		name: `${numbers[index]} ${video.title}`,
		value: [
			`**${video.channel?.name}**`,
			`https://youtu.be/${video.id}`,
			`Duration: ${video.duration ? secondToTime(video.duration) : "-"}`,
		].join("\n"),
		inline: false,
	};
};
