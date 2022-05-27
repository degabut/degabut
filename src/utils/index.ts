import { Video } from "@modules/youtube/entities/Video";
import { VideoCompact } from "@modules/youtube/entities/VideoCompact";
import { EmbedField, MessageButton } from "discord.js";

export const secondToTime = (seconds: number): string => {
	return new Date(seconds * 1000).toISOString().substring(11, 19).replace("-", ":");
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

export const extractYoutubeVideoId = (url: string): string => {
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);
	return match && match[2].length === 11 ? match[2] : "";
};

export const shuffle = <T>(array: T[]): T[] => {
	const shuffled = [...array];

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};
