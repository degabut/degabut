import { entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { GuildMember, TextChannel } from "discord.js";
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
		const channel = member.voice.channel;
		queue = new Queue({
			voiceConnection: joinVoiceChannel({
				channelId: channel.id,
				guildId: channel.guild.id,
				adapterCreator: channel.guild.voiceAdapterCreator,
			}),
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
