import { ButtonInteraction } from "@discord-bot/decorators";
import { ButtonInteractionResult, IButtonInteraction } from "@discord-bot/interfaces";
import { NotFoundException } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AddTrackCommand, PlayTrackCommand } from "@queue/commands";
import { GuildMember, Interaction } from "discord.js";

@ButtonInteraction({
  name: "play-track",
  key: "play-track/:id/:videoId",
})
export class PlayTrackButtonInteraction implements IButtonInteraction {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(
    interaction: Interaction,
    args: { id: string; videoId?: string },
  ): Promise<ButtonInteractionResult> {
    if (!interaction.isButton()) return;

    if (
      !(interaction.member instanceof GuildMember) ||
      !interaction.guild ||
      !interaction.member.voice.channelId
    ) {
      await interaction.deferUpdate();
      return;
    }

    try {
      const command = new PlayTrackCommand({
        trackId: args.id,
        voiceChannelId: interaction.member.voice.channelId,
        executor: { id: interaction.member.id },
      });
      const result = await this.commandBus.execute(command);
      if (result) await interaction.deferUpdate();
    } catch (err) {
      if (!(err instanceof NotFoundException)) throw err;
      if (!args.videoId) return;

      const command = new AddTrackCommand({
        videoId: args.videoId,
        voiceChannelId: interaction.member.voice.channelId,
        executor: { id: interaction.member.id },
      });

      const result = await this.commandBus.execute(command);
      if (result) await interaction.deferUpdate();
    }
  }
}
