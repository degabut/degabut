import { Lyric } from "@modules/lyric/entities/Lyric";
import { GetLyricAdapter, GetLyricUseCase } from "@modules/lyric/useCases/GetLyricUseCase";
import {
	GetNowPlayingLyricAdapter,
	GetNowPlayingLyricUseCase,
} from "@modules/queue/useCases/GetNowPlayingLyricUseCase";
import { MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class LyricCommand implements ICommand {
	public readonly name = "lyric";
	public readonly description = "Get lyric of current playing song or by keyword";

	constructor(
		@inject(GetLyricUseCase) private getLyric: GetLyricUseCase,
		@inject(GetNowPlayingLyricUseCase)
		private getNowPlayingLyric: GetNowPlayingLyricUseCase
	) {}

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const keyword = args.join(" ");

		let lyric: Lyric;

		if (keyword) {
			const adapter = new GetLyricAdapter({ keyword });
			lyric = await this.getLyric.execute(adapter, { userId: message.author.id });
		} else {
			const adapter = new GetNowPlayingLyricAdapter({ guildId: message.guild?.id });
			lyric = await this.getNowPlayingLyric.execute(adapter, { userId: message.author.id });
		}

		let maxLength = 4096;
		maxLength -= lyric.sourceUrl.length - 16;

		const embed = new MessageEmbed({
			title: `${lyric.author} — ${lyric.title}`,
			description: [
				lyric.sourceUrl,
				"",
				lyric.content.length > maxLength
					? lyric.content.slice(0, maxLength) + "..."
					: lyric.content,
			].join("\n"),
		});

		await message.reply({ embeds: [embed] });
	}
}
