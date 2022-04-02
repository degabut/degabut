import {
	GetNowPlayingAdapter,
	GetNowPlayingUseCase,
} from "@modules/queue/useCases/GetNowPlayingUseCase";
import { GetRelatedAdapter, GetRelatedUseCase } from "@modules/queue/useCases/GetRelatedUseCase";
import { videoToEmbedField, videoToMessageButton } from "@utils";
import { MessageActionRow, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class RelatedCommand implements ICommand {
	public readonly name = "related";
	public readonly description = "Show songs related to the current song";

	constructor(
		@inject(GetRelatedUseCase) private getRelated: GetRelatedUseCase,
		@inject(GetNowPlayingUseCase) private getNowPlaying: GetNowPlayingUseCase
	) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const getNowPlayingAdapter = new GetNowPlayingAdapter({ guildId: message.guild?.id });
		const getRelatedAdapter = new GetRelatedAdapter({ guildId: message.guild?.id });

		const [nowPlaying, relatedVideos] = await Promise.all([
			this.getNowPlaying.execute(getNowPlayingAdapter, { userId: message.author.id }),
			this.getRelated.execute(getRelatedAdapter, { userId: message.author.id }),
		]);

		const buttons = relatedVideos.map((v, i) => videoToMessageButton(v, i, "related"));

		await message.reply({
			content: `⭐ **Songs related with ${nowPlaying?.video.title}**`,
			embeds: [new MessageEmbed({ fields: relatedVideos.map(videoToEmbedField) })],
			components: [
				new MessageActionRow({ components: buttons.slice(0, 5) }),
				new MessageActionRow({ components: buttons.slice(5, 10) }),
			],
		});
	}
}
