import { DiscordUtil } from "@common/utils";
import { Injectable } from "@nestjs/common";
import { YoutubeiProvider } from "@youtube/providers";
import {
  ActionRowBuilder,
  EmbedBuilder,
  Message,
  MessageActionRowComponentBuilder,
} from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand, PrefixCommandResult } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "search",
  aliases: ["s"],
})
export class SearchPrefixCommand implements IPrefixCommand {
  public readonly name = "search";
  public readonly aliases = ["s"];
  public readonly description = "Search for a song";

  constructor(private readonly youtubeiProvider: YoutubeiProvider) {}

  public async handler(message: Message, args: string[]): Promise<PrefixCommandResult> {
    const keyword = args.join(" ");

    const videos = await this.youtubeiProvider.searchVideo(keyword);
    const splicedVideos = videos.slice(0, 10);

    const buttons = splicedVideos.map((v, i) =>
      DiscordUtil.videoToMessageButton(v, i, `play/${v.id}`),
    );

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
