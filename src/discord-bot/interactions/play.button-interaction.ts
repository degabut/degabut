import { ButtonInteraction } from "@discord-bot/decorators";
import { ButtonInteractionResult, IButtonInteraction } from "@discord-bot/interfaces";
import { CommandBus } from "@nestjs/cqrs";
import { AddTrackCommand } from "@queue/commands";
import { GuildMember, Interaction } from "discord.js";

@ButtonInteraction({
  name: "play",
  key: "play/:id",
})
export class PlayButtonInteraction implements IButtonInteraction {
  constructor(private readonly commandBus: CommandBus) {}

  public async handler(
    interaction: Interaction,
    args: { id: string },
  ): Promise<ButtonInteractionResult> {
    if (!interaction.isButton()) return;

    if (!(interaction.member instanceof GuildMember) || !interaction.guild) {
      await interaction.deferUpdate();
      return;
    }

    const command = new AddTrackCommand({
      videoId: args.id,
      guildId: interaction.guild.id,
      requestedBy: interaction.member.id,
    });

    await this.commandBus.execute(command);
    await interaction.deferUpdate();
  }
}
