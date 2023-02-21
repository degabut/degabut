import { DiscordUtil } from "@common/utils";
import { CommandResult, IPrefixCommand } from "@discord-bot/interfaces";
import { Inject, Injectable } from "@nestjs/common";
import { IYoutubeiProvider } from "@youtube/providers";
import { YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";
import {
  ActionRowBuilder,
  EmbedBuilder,
  Message,
  MessageActionRowComponentBuilder,
} from "discord.js";

import { PrefixCommand } from "../decorators";

@Injectable()
@PrefixCommand({
  name: "search",
  aliases: ["s"],
})
export class SearchDiscordCommand implements IPrefixCommand {
  public readonly name = "search";
  public readonly aliases = ["s"];
  public readonly description = "Search for a song";

  constructor(
    @Inject(YOUTUBEI_PROVIDER)
    private readonly youtubeiProvider: IYoutubeiProvider,
  ) {}

  public async prefixHandler(message: Message, args: string[]): Promise<CommandResult> {
    const keyword = args.join(" ");

    const videos = await this.youtubeiProvider.searchVideo(keyword);
    const splicedVideos = videos.slice(0, 10);

    const buttons = splicedVideos.map((v, i) => DiscordUtil.videoToMessageButton(v, i));

    return {
      embeds: [
        new EmbedBuilder({
          fields: splicedVideos.map(DiscordUtil.videoToEmbedField),
        }),
      ],
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
