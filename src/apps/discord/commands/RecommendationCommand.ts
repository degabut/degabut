import {
	GetLastPlayedAdapter,
	GetLastPlayedUseCase,
} from "@modules/user/useCases/GetLastPlayedUseCase";
import {
	GetMostPlayedAdapter,
	GetMostPlayedUseCase,
} from "@modules/user/useCases/GetMostPlayedUseCase";
import { ArrayUtils, DiscordUtils } from "@utils";
import { MessageActionRow, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";
import { SearchInteractionCommand } from "../interactions/SearchInteractionCommand";

@injectable()
export class RecommendationCommand implements ICommand {
	public readonly name = "recommend";
	public readonly aliases = ["recommendation", "recommendations"];
	public readonly description = "Show songs recommendation";

	constructor(
		@inject(GetLastPlayedUseCase)
		private getLastPlayed: GetLastPlayedUseCase,
		@inject(GetMostPlayedUseCase)
		private getMostPlayed: GetMostPlayedUseCase,
		@inject(SearchInteractionCommand)
		private searchInteractionCommand: SearchInteractionCommand
	) {}

	public async execute({ message }: CommandExecuteProps): Promise<unknown> {
		const userId = message.mentions.users.first()?.id || message.author.id;
		const context = { userId: message.author.id };
		const lastPlayedAdapter = new GetLastPlayedAdapter({ count: 5, userId });
		const mostPlayedAdapter = new GetMostPlayedAdapter({ count: 5, userId });

		const [lastPlayed, mostPlayed] = await Promise.all([
			this.getLastPlayed.execute(lastPlayedAdapter, context),
			this.getMostPlayed.execute(mostPlayedAdapter, context),
		]);

		const filteredLastPlayed = ArrayUtils.shuffle(lastPlayed).filter(
			(v) => !mostPlayed.find((l) => l.id === v.id)
		);
		const slicedMostPlayed = ArrayUtils.shuffle(
			mostPlayed.slice(0, Math.max(7, 10 - filteredLastPlayed.length))
		);
		const slicedLastPlayed = filteredLastPlayed.slice(0, 10 - slicedMostPlayed.length);

		const videos = [...slicedLastPlayed, ...slicedMostPlayed];
		if (!videos.length) return await message.reply("No recommendation found");

		const buttons = videos.map((v, i) =>
			DiscordUtils.videoToMessageButton(v, i, this.searchInteractionCommand.name)
		);

		const components = [new MessageActionRow({ components: buttons.slice(0, 5) })];
		if (buttons.length > 5)
			components.push(new MessageActionRow({ components: buttons.slice(5, 10) }));

		await message.reply({
			embeds: [new MessageEmbed({ fields: videos.map(DiscordUtils.videoToEmbedField) })],
			components,
		});
	}
}
