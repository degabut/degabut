import { CommandBus } from "@nestjs/cqrs";
import { AddTracksCommand } from "@queue/commands";
import { GuildMember, Interaction } from "discord.js";

import { ButtonInteraction } from "../decorators";
import { ButtonInteractionResult, IButtonInteraction } from "../interfaces";

@ButtonInteraction({
  name: "add-track",
  key: "add-track/:source/:id",
})
export class AddTrackButtonInteraction implements IButtonInteraction {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(
    interaction: Interaction,
    args: { id: string; source: string },
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

    const command = new AddTracksCommand({
      mediaSourceId: `${args.source}/${args.id}`,
      voiceChannelId: interaction.member.voice.channelId,
      executor: { id: interaction.member.id },
    });

    await this.commandBus.execute(command);
    await interaction.deferUpdate();
  }
}
