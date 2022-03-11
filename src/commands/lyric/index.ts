import { Command, MessageEmbed } from "discord.js";
import { scrapeLyric } from "./scrapeLyric";
import { scrapeSearchEngine } from "./scrapeSearchEngine";

const command: Command = {
	name: "lyric",
	description: "Get lyric of current playing song or by keyword",
	async execute(message, args) {
		const queue = message.queue;
		const keyword = args.join(" ") || queue?.nowPlaying?.title;
		if (!keyword) return;

		const url = await scrapeSearchEngine(keyword);
		if (!url) return message.reply("Can't find lyric");
		const lyric = await scrapeLyric(url);
		if (!lyric) return message.reply("Can't find lyric");

		let length = 4096;
		length = length - url.length - 16;

		const embed = new MessageEmbed({
			title: `${lyric.title} ${lyric.subtitle}`,
			description: [
				url,
				"",
				lyric.content.length > length ? lyric.content.slice(0, length) + "..." : lyric.content,
			].join("\n"),
		});

		await message.reply({ embeds: [embed] });
	},
};

export default command;
