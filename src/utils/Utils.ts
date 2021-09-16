import { RepeatMode, Song } from "discord-music-player";
import { MessageEmbed } from "discord.js";

export const getEmbedFromSong = (song: Song, progressBar?: string): MessageEmbed => {
	const fields = [{ name: "Duration", value: song.duration }];
	if (progressBar) fields.unshift({ name: "Length", value: progressBar });

	return new MessageEmbed({
		title: song.name,
		description: song.author,
		url: song.url,
		image: { url: song.thumbnail },
		fields,
	});
};

export const getRepeatStateMessage = (state: RepeatMode): string => {
	if (state === RepeatMode.SONG) return "🔂 **Looping Song**";
	if (state === RepeatMode.QUEUE) return "🔁 **Looping Queue**";
	return "▶ **Loop disabled**";
};
