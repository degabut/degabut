import { GetRelatedAdapter, GetRelatedUseCase } from "@modules/queue/useCases/GetRelatedUseCase";
import { DiscordUtils } from "@utils";
import { MessageActionRow, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class RelatedCommand implements ICommand {
	public readonly name = "related";
	public readonly description = "Show songs related to the current song";

	constructor(@inject(GetRelatedUseCase) private getRelated: GetRelatedUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const getRelatedAdapter = new GetRelatedAdapter({ guildId: message.guild?.id });

		const { target, videos } = await this.getRelated.execute(getRelatedAdapter, {
			userId: message.author.id,
		});

		const buttons = videos.map((v, i) => DiscordUtils.videoToMessageButton(v, i, "related"));

		await message.reply({
			content: `⭐ **Songs related with ${target?.video.title}**`,
			embeds: [new MessageEmbed({ fields: videos.map(DiscordUtils.videoToEmbedField) })],
			components: [
				new MessageActionRow({ components: buttons.slice(0, 5) }),
				new MessageActionRow({ components: buttons.slice(5, 10) }),
			],
		});
	}
}
