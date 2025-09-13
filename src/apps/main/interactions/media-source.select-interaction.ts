import { DiscordBotService } from "@main/discord-bot.service";
import { CommandExceptionFilter } from "@main/filters";
import { Injectable, UseFilters } from "@nestjs/common";
import { BaseGuildTextChannel, GuildMember } from "discord.js";
import { Context, SelectedStrings, StringSelect, StringSelectContext } from "necord";

export const MEDIA_SOURCE_SELECT_INTERACTION = "media-source-select";

@Injectable()
export class MediaSourceSelectInteraction {
  constructor(private readonly service: DiscordBotService) {}

  @UseFilters(new CommandExceptionFilter())
  @StringSelect(MEDIA_SOURCE_SELECT_INTERACTION)
  public async handler(
    @Context() context: StringSelectContext,
    @SelectedStrings() selected: string[],
  ) {
    const [interaction] = context;
    const id = selected.at(0);

    if (
      !(interaction.member instanceof GuildMember) ||
      !interaction.guild ||
      !interaction.member.voice.channel ||
      !selected
    ) {
      await interaction.deferUpdate();
      return;
    }

    await this.service.joinAndAddTrack({
      userId: interaction.member.id,
      voiceChannel: interaction.member.voice.channel,
      textChannel:
        interaction.channel instanceof BaseGuildTextChannel ? interaction.channel : undefined,
      mediaSourceId: id,
    });

    await interaction.deferUpdate();
  }
}
