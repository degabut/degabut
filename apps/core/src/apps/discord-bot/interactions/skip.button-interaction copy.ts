import { CommandBus } from "@nestjs/cqrs";
import { SkipCommand } from "@queue-player/commands";
import { GuildMember, Interaction } from "discord.js";

import { ButtonInteraction } from "../decorators";
import { ButtonInteractionResult, IButtonInteraction } from "../interfaces";

@ButtonInteraction({
  name: "skip",
  key: "skip",
})
export class SkipButtonInteraction implements IButtonInteraction {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(interaction: Interaction): Promise<ButtonInteractionResult> {
    if (!interaction.isButton()) return;

    if (
      !(interaction.member instanceof GuildMember) ||
      !interaction.guild ||
      !interaction.member.voice.channelId
    ) {
      await interaction.deferUpdate();
      return;
    }

    const command = new SkipCommand({
      voiceChannelId: interaction.member.voice.channelId,
      executor: { id: interaction.member.id },
    });

    await this.commandBus.execute(command);
    await interaction.deferUpdate();
  }
}
