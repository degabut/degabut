import { ButtonInteraction } from "@discord-bot/decorators";
import { ButtonInteractionResult, IButtonInteraction } from "@discord-bot/interfaces";
import { CommandBus } from "@nestjs/cqrs";
import { PlayTrackCommand } from "@queue/commands";
import { GuildMember, Interaction } from "discord.js";

@ButtonInteraction({
  name: "play-track",
  key: "play-track/:id",
})
export class PlayTrackButtonInteraction implements IButtonInteraction {
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

    const command = new PlayTrackCommand({
      trackId: args.id,
      voiceChannelId: interaction.member.voice.channelId,
      executor: { id: interaction.member.id },
    });

    const result = await this.commandBus.execute(command);
    if (result) await interaction.deferUpdate();
  }
}
