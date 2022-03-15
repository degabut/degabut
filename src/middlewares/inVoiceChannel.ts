import { GuildMember, Middleware } from "discord.js";
import { queues } from "../shared";

export const inSameVoiceChannel: Middleware = async (message) => {
	if (!(message.member instanceof GuildMember)) throw new Error("Invalid message");
	if (!message.member.voice.channel?.id) throw new Error("Not in a valid voice channel");

	const queue = message.guild ? queues.get(message.guild.id) : undefined;
	if (!queue) return;
	if (message.member.voice.channel.id !== queue.voiceChannel.id)
		throw new Error("Not in a valid voice channel");
};
