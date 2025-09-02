import { ButtonInteraction } from "@main/decorators";
import { ButtonInteractionResult, IButtonInteraction } from "@main/interfaces";
import { MediaSourceType } from "@media-source/entities";
import { NotFoundException } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AddNextTrackCommand, AddTracksCommand } from "@queue/commands";
import { GuildMember, Interaction } from "discord.js";

@ButtonInteraction({
  name: "play-track",
  key: "play-track/:trackId/:source/:id",
})
export class PlayTrackButtonInteraction implements IButtonInteraction {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(
    interaction: Interaction,
    args: { trackId: string; source?: MediaSourceType; id?: string },
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
      const command = new AddNextTrackCommand({
        trackId: args.trackId,
        playNow: true,
        voiceChannelId: interaction.member.voice.channelId,
        executor: { id: interaction.member.id },
      });
      const result = await this.commandBus.execute(command);
      if (result) await interaction.deferUpdate();
    } catch (err) {
      if (!(err instanceof NotFoundException)) throw err;
      if (!args.source || !args.id) return;

      const command = new AddTracksCommand({
        mediaSourceId: `${args.source}/${args.id}`,
        voiceChannelId: interaction.member.voice.channelId,
        executor: { id: interaction.member.id },
      });

      const result = await this.commandBus.execute(command);
      if (result.length) await interaction.deferUpdate();
    }
  }
}
