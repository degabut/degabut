import { DiscordUtil } from "@common/utils";
import { IPrefixCommand } from "@discord-bot/interfaces";
import { MediaSource } from "@media-source/entities";
import { Inject, Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetQueueQuery } from "@queue/queries";
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
  name: "related",
})
export class RelatedDiscordCommand implements IPrefixCommand {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(YOUTUBEI_PROVIDER)
    private readonly youtubeiProvider: IYoutubeiProvider,
  ) {}

  public async prefixHandler(message: Message): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const query = new GetQueueQuery({
      voiceChannelId: message.member.voice.channelId,
      executor: { id: message.author.id },
    });
    const queue = await this.queryBus.execute(query);

    const { playedYoutubeVideoId, title } = queue?.nowPlaying?.mediaSource;
    if (!playedYoutubeVideoId) return;

    const video = await this.youtubeiProvider.getVideo(playedYoutubeVideoId);
    if (!video) return;

    const sources = video.related.map(MediaSource.fromYoutube);
    const buttons = sources.map(DiscordUtil.sourceToMessageButton);
    const fields = sources.slice(0, 10).map(DiscordUtil.sourceToEmbedField);

    await message.reply({
      content: `⭐ **Songs related with ${title}**`,
      embeds: [new EmbedBuilder({ fields })],
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>({
          components: buttons.slice(0, 5),
        }),
        new ActionRowBuilder<MessageActionRowComponentBuilder>({
          components: buttons.slice(5, 10),
        }),
      ],
    });
  }
}
