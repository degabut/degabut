import { CommandExceptionFilter } from "@main/filters";
import { Injectable, UseFilters } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AddTracksCommand } from "@queue/commands";
import { GuildMember } from "discord.js";
import { Context, SelectedStrings, StringSelect, StringSelectContext } from "necord";

export const MEDIA_SOURCE_SELECT_INTERACTION = "media-source-select";

@Injectable()
export class MediaSourceSelectInteraction {
  constructor(private readonly commandBus: CommandBus) {}

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
      !interaction.member.voice.channelId ||
      !selected
    ) {
      await interaction.deferUpdate();
      return;
    }

    const command = new AddTracksCommand({
      mediaSourceId: id,
      voiceChannelId: interaction.member.voice.channelId,
      executor: { id: interaction.member.id },
    });

    await this.commandBus.execute(command);
    await interaction.deferUpdate();
  }
}
