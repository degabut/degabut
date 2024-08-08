import { DiscordUtil } from "@common/utils";
import { MediaSource } from "@media-source/entities";
import { Inject, Injectable, UseFilters } from "@nestjs/common";
import { IYoutubeiProvider } from "@youtube/providers";
import { YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";
import {
  ActionRowBuilder,
  Message,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { Context, Options, SlashCommand, SlashCommandContext, StringOption } from "necord";

import { TextCommand } from "../decorators";
import { CommandExceptionFilter } from "../filters";
import { MEDIA_SOURCE_SELECT_INTERACTION } from "../interactions/media-source.select-interaction";
import { CommandResult } from "../interfaces";

class SearchDto {
  @StringOption({ name: "keyword", description: "Keyword", required: true, min_length: 1 })
  keyword!: string;
}

@Injectable()
export class SearchDiscordCommand {
  private static readonly commandName = "search";
  private static readonly description = "Search for a song";

  constructor(
    @Inject(YOUTUBEI_PROVIDER)
    private readonly youtubeiProvider: IYoutubeiProvider,
  ) {}

  @TextCommand({
    name: SearchDiscordCommand.commandName,
    aliases: ["s"],
    description: SearchDiscordCommand.description,
  })
  public async prefixHandler(_: Message, args: string[]): Promise<CommandResult> {
    const keyword = args.join(" ");
    return await this.handler(keyword);
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: SearchDiscordCommand.commandName,
    description: SearchDiscordCommand.description,
  })
  async slashHandler(@Context() context: SlashCommandContext, @Options() options: SearchDto) {
    const [interaction] = context;
    const { keyword } = options;
    const response = await this.handler(keyword);
    await interaction.reply(response);
  }

  private async handler(keyword: string) {
    const videos = await this.youtubeiProvider.searchVideo(keyword);
    const sources = videos.slice(0, 10).map((v) => MediaSource.fromYoutube(v));

    return {
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>({
          components: [
            new StringSelectMenuBuilder()
              .setCustomId(MEDIA_SOURCE_SELECT_INTERACTION)
              .setPlaceholder("Search Result")
              .setOptions(sources.map(DiscordUtil.sourceToSelectOption)),
          ],
        }),
      ],
    };
  }
}
