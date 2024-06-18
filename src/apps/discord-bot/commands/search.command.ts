import { DiscordUtil } from "@common/utils";
import { CommandExceptionFilter } from "@discord-bot/filters";
import { CommandResult } from "@discord-bot/interfaces";
import { MediaSource } from "@media-source/entities";
import { Inject, Injectable, UseFilters } from "@nestjs/common";
import { IYoutubeiProvider } from "@youtube/providers";
import { YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";
import {
  ActionRowBuilder,
  EmbedBuilder,
  Message,
  MessageActionRowComponentBuilder,
} from "discord.js";
import { Options, SlashCommand, StringOption } from "necord";

import { TextCommand } from "../decorators";

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
  async slashHandler(@Options() options: SearchDto) {
    const { keyword } = options;
    return await this.handler(keyword);
  }

  private async handler(keyword: string) {
    const videos = await this.youtubeiProvider.searchVideo(keyword);
    const sources = videos.slice(0, 10).map((v) => MediaSource.fromYoutube(v));

    const buttons = sources.map(DiscordUtil.sourceToMessageButton);
    const fields = sources.map(DiscordUtil.sourceToEmbedField);

    return {
      embeds: [new EmbedBuilder({ fields })],
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>({
          components: buttons.slice(0, 5),
        }),
        new ActionRowBuilder<MessageActionRowComponentBuilder>({
          components: buttons.slice(5, 10),
        }),
      ],
    };
  }
}
