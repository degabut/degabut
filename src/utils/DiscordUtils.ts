import { Video } from "@modules/youtube/entities/Video";
import { VideoCompact } from "@modules/youtube/entities/VideoCompact";
import { EmbedField, MessageButton } from "discord.js";
import { CommonUtils } from "./CommonUtils";

const numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export class DiscordUtils {
	static videoToMessageButton(
		video: Video | VideoCompact,
		index: number,
		idPrefix?: string
	): MessageButton {
		return new MessageButton({
			customId: `${idPrefix}/${video.id}`,
			label: video.title.length < 20 ? video.title : video.title.substring(0, 20) + "...",
			style: "SUCCESS",
			emoji: numbers[index],
		});
	}

	static videoToEmbedField(video: Video | VideoCompact, index: number): EmbedField {
		return {
			name: `${numbers[index]} ${video.title}`,
			value: [
				`**${video.channel?.name}**`,
				`https://youtu.be/${video.id}`,
				`Duration: ${video.duration ? CommonUtils.secondToTime(video.duration) : "-"}`,
			].join("\n"),
			inline: false,
		};
	}
}
