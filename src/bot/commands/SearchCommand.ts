import { MessageActionRow, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import { SearchVideoUseCase } from "../../modules/youtube";
import { videoToEmbedField, videoToMessageButton } from "../../utils";
import { CommandExecuteProps, ICommand } from "../core";
import { SearchInteractionCommand } from "../interactions";

@injectable()
export class SearchCommand implements ICommand {
	public readonly name = "search";
	public readonly aliases = ["s"];
	public readonly description = "Search for a song";

	constructor(
		@inject(SearchVideoUseCase) private searchVideo: SearchVideoUseCase,
		@inject(SearchInteractionCommand) private searchInteractionCommand: SearchInteractionCommand
	) {}

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const keyword = args.join("");

		const videos = await this.searchVideo.execute({ keyword });

		const buttons = videos.map((v, i) =>
			videoToMessageButton(v, i, this.searchInteractionCommand.name)
		);

		await message.reply({
			embeds: [new MessageEmbed({ fields: videos.map(videoToEmbedField) })],
			components: [
				new MessageActionRow({ components: buttons.slice(0, 5) }),
				new MessageActionRow({ components: buttons.slice(5, 10) }),
			],
		});
	}
}
