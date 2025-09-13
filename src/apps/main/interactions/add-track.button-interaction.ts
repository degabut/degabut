import { ButtonInteraction } from "@main/decorators";
import { DiscordBotService } from "@main/discord-bot.service";
import { ButtonInteractionResult, IButtonInteraction } from "@main/interfaces";
import { BaseGuildTextChannel, GuildMember, Interaction } from "discord.js";

@ButtonInteraction({
  name: "add-track",
  key: "add-track/:source/:id",
})
export class AddTrackButtonInteraction implements IButtonInteraction {
  constructor(private readonly service: DiscordBotService) {}

  public async handler(
    interaction: Interaction,
    args: { id: string; source: string },
  ): Promise<ButtonInteractionResult> {
    if (!interaction.isButton()) return;

    if (
      !(interaction.member instanceof GuildMember) ||
      !interaction.guild ||
      !interaction.member.voice.channel
    ) {
      await interaction.deferUpdate();
      return;
    }

    await this.service.joinAndAddTrack({
      userId: interaction.member.id,
      voiceChannel: interaction.member.voice.channel,
      textChannel:
        interaction.channel instanceof BaseGuildTextChannel
          ? (interaction.channel as BaseGuildTextChannel)
          : undefined,
      mediaSourceId: `${args.source}/${args.id}`,
    });

    await interaction.deferUpdate();
  }
}
