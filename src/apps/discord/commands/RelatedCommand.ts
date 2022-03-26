import { GetNowPlayingUseCase, GetRelatedUseCase } from "@modules/queue";
import { videoToEmbedField, videoToMessageButton } from "@utils";
import { MessageActionRow, MessageEmbed } from "discord.js";
import { delay, inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core";

@injectable()
export class RelatedCommand implements ICommand {
	public readonly name = "related";
	public readonly description = "Show songs related to the current song";

	constructor(
		@inject(delay(() => GetRelatedUseCase)) private getRelated: GetRelatedUseCase,
		@inject(delay(() => GetNowPlayingUseCase)) private getNowPlaying: GetNowPlayingUseCase
	) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const [nowPlaying, relatedVideos] = await Promise.all([
			this.getNowPlaying.execute({ guildId: message.guild?.id }),
			this.getRelated.execute({ guildId: message.guild?.id }),
		]);

		const buttons = relatedVideos.map((v, i) => videoToMessageButton(v, i, "related"));

		await message.reply({
			content: `⭐ **Songs related with ${nowPlaying?.title}**`,
			embeds: [new MessageEmbed({ fields: relatedVideos.map(videoToEmbedField) })],
			components: [
				new MessageActionRow({ components: buttons.slice(0, 5) }),
				new MessageActionRow({ components: buttons.slice(5, 10) }),
			],
		});
	}
}
