import { ButtonInteraction, GuildMember, Message, TextChannel } from "discord.js";
import { inject, injectable } from "tsyringe";
import { AddTrackUseCase } from "../../modules/queue";
import { IInteractionCommand } from "../core";

@injectable()
export class RelatedInteractionCommand implements IInteractionCommand<string> {
	public readonly name = "related";
	public readonly description = "Play related song";

	constructor(@inject(AddTrackUseCase) private addTrack: AddTrackUseCase) {}

	buttonInteractionIdParser(customId: string): string {
		const [, videoId] = customId.split("/");
		return videoId;
	}

	async execute(interaction: ButtonInteraction, videoId: string): Promise<void> {
		await interaction.deferUpdate();
		if (
			!(interaction.member instanceof GuildMember) ||
			!(interaction.channel instanceof TextChannel) ||
			!(interaction.message instanceof Message)
		)
			return;

		await this.addTrack.execute({
			id: videoId,
			guildId: interaction.message.guild?.id,
			requestedBy: interaction.member,
			textChannel: interaction.channel,
			voiceChannel: interaction.member.voice.channel || undefined,
		});
	}
}
