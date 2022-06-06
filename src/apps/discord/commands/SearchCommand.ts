import {
	SearchVideoAdapter,
	SearchVideoUseCase,
} from "@modules/youtube/useCases/SearchVideoUseCase";
import { DiscordUtils } from "@utils";
import { MessageActionRow, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";
import { SearchInteractionCommand } from "../interactions/SearchInteractionCommand";

@injectable()
export class SearchCommand implements ICommand {
	public readonly name = "search";
	public readonly aliases = ["s"];
	public readonly description = "Search for a song";

	constructor(
		@inject(SearchVideoUseCase) private searchVideo: SearchVideoUseCase,
		@inject(SearchInteractionCommand)
		private searchInteractionCommand: SearchInteractionCommand
	) {}

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const keyword = args.join("");

		const adapter = new SearchVideoAdapter({ keyword });
		const videos = await this.searchVideo.execute(adapter, {
			userId: message.author.id,
		});
		const splicedVideos = videos.slice(0, 10);

		const buttons = splicedVideos.map((v, i) =>
			DiscordUtils.videoToMessageButton(v, i, this.searchInteractionCommand.name)
		);

		await message.reply({
			embeds: [new MessageEmbed({ fields: splicedVideos.map(DiscordUtils.videoToEmbedField) })],
			components: [
				new MessageActionRow({ components: buttons.slice(0, 5) }),
				new MessageActionRow({ components: buttons.slice(5, 10) }),
			],
		});
	}
}
