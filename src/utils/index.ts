import { Video } from "@modules/youtube/entities/Video";
import { VideoCompact } from "@modules/youtube/entities/VideoCompact";
import { Transform } from "class-transformer";
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

export const randomInt = (min: number, max: number): number => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const pickRankedRandom = <T>(arr: T[]): T | undefined => {
	const n = (Math.pow(arr.length, 2) + arr.length) / 2;

	const chances = arr.map((_, i) => (i + 1) / n).reverse();
	const oneBasedChances = chances.map((c, i, arr) => {
		const totalPrev = arr.slice(0, i).reduce((p, c) => p + c, 0);
		return c + totalPrev;
	});

	const random = Math.random();
	const index = oneBasedChances.findIndex((c) => c > random);

	return arr[index >= 0 ? index : 0];
};

export const CollectionType = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	dto: { create: (v: any) => unknown },
	accessor?: string
): PropertyDecorator => {
	return Transform(({ obj, key }) => {
		const value = accessor ? obj[accessor] : obj[key];
		return [...value.values()].map(dto.create);
	});
};
