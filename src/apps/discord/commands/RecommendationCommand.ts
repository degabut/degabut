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
	public readonly description = "Show songs recommendation";

	constructor(
		@inject(GetRecommendationUseCase)
		private getRecommendation: GetRecommendationUseCase,
		@inject(SearchInteractionCommand)
		private searchInteractionCommand: SearchInteractionCommand
	) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new GetRecommendationAdapter({ count: 10 });
		const videos = await this.getRecommendation.execute(adapter, {
			userId: message.author.id,
		});

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
