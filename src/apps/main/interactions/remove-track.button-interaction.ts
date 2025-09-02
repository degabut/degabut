import { ButtonInteraction } from "@main/decorators";
import { ButtonInteractionResult, IButtonInteraction } from "@main/interfaces";
import { CommandBus } from "@nestjs/cqrs";
import { RemoveTrackCommand } from "@queue/commands";
import { GuildMember, Interaction } from "discord.js";

@ButtonInteraction({
  name: "remove-track",
  key: "remove-track/:id",
})
export class RemoveTrackButtonInteraction implements IButtonInteraction {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(
    interaction: Interaction,
    args: { id: string },
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

    const command = new RemoveTrackCommand({
      trackId: args.id,
      voiceChannelId: interaction.member.voice.channelId,
      executor: { id: interaction.member.id },
    });

    const result = await this.commandBus.execute(command);

    if (result) await interaction.deferUpdate();
  }
}
