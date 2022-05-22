import {
	GetRecommendationAdapter,
	GetRecommendationUseCase,
} from "@modules/user/useCases/GetRecommendationUseCase";
import { videoToEmbedField, videoToMessageButton } from "@utils";
import { MessageActionRow, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";
import { SearchInteractionCommand } from "../interactions/SearchInteractionCommand";

@injectable()
export class RecommendationCommand implements ICommand {
	public readonly name = "recommend";
	public readonly aliases = ["recommendation"];
	public readonly description = "Show songs recommendation";

	constructor(
		@inject(GetRecommendationUseCase)
		private getRecommendation: GetRecommendationUseCase,
		@inject(SearchInteractionCommand)
		private searchInteractionCommand: SearchInteractionCommand
	) {}

	public async execute({ message }: CommandExecuteProps): Promise<unknown> {
		const adapter = new GetRecommendationAdapter({ count: 5 });
		const { lastPlayed, mostPlayed } = await this.getRecommendation.execute(adapter, {
			userId: message.author.id,
		});

		const filteredLastPlayed = lastPlayed.filter((v) => !mostPlayed.find((l) => l.id === v.id));
		const slicedMostPlayed = mostPlayed.slice(0, Math.max(5, 10 - filteredLastPlayed.length));
		const slicedLastPlayed = filteredLastPlayed.slice(0, 10 - slicedMostPlayed.length);

		const videos = [...slicedLastPlayed, ...slicedMostPlayed];
		if (!videos.length) return await message.reply("No recommendation found");

		const buttons = videos.map((v, i) =>
			videoToMessageButton(v, i, this.searchInteractionCommand.name)
		);

		const components = [new MessageActionRow({ components: buttons.slice(0, 5) })];
		if (buttons.length > 5) new MessageActionRow({ components: buttons.slice(5, 10) });

		await message.reply({
			embeds: [new MessageEmbed({ fields: videos.map(videoToEmbedField) })],
			components,
		});
	}
}
