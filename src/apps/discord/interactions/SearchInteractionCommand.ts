import { AddTrackUseCase } from "@modules/queue/useCases/AddTrackUseCase";
import { ButtonInteraction, GuildMember, Message, TextChannel } from "discord.js";
import { inject, injectable } from "tsyringe";
import { IInteractionCommand } from "../core/IInteractionCommand";

@injectable()
export class SearchInteractionCommand implements IInteractionCommand {
	public readonly name = "search";
	public readonly description = "Search for a song";

	constructor(@inject(AddTrackUseCase) private addTrack: AddTrackUseCase) {}

	buttonInteractionIdParser(customId: string): string {
		const [, videoId] = customId.split("/");
		return videoId;
	}

	async execute(interaction: ButtonInteraction, videoId: string): Promise<void> {
		if (
			!(interaction.member instanceof GuildMember) ||
			!(interaction.channel instanceof TextChannel) ||
			!(interaction.message instanceof Message)
		) {
			await interaction.deferUpdate();
			return;
		}

		await this.addTrack.execute(
			{
				id: videoId,
				guildId: interaction.message.guild?.id,
				textChannel: interaction.channel,
				voiceChannel: interaction.member.voice.channel || undefined,
			},
			{ userId: interaction.member.id }
		);
		await interaction.deferUpdate();
	}
}
