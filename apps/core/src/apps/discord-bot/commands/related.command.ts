import { DiscordUtil } from "@common/utils";
import { MediaSource } from "@media-source/entities";
import { Inject, Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetQueueQuery } from "@queue/queries";
import { IYoutubeiProvider } from "@youtube/providers";
import { YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";
import {
  ActionRowBuilder,
  Message,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

import { TextCommand } from "../decorators";
import { MEDIA_SOURCE_SELECT_INTERACTION } from "../interactions/media-source.select-interaction";

@Injectable()
export class RelatedDiscordCommand {
  private static readonly commandName = "related";
  private static readonly description = "Shows songs related with the current playing song";

  constructor(
    private readonly queryBus: QueryBus,
    @Inject(YOUTUBEI_PROVIDER)
    private readonly youtubeiProvider: IYoutubeiProvider,
  ) {}

  @TextCommand({
    name: RelatedDiscordCommand.commandName,
    description: RelatedDiscordCommand.description,
  })
  public async prefixHandler(message: Message): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const query = new GetQueueQuery({
      voiceChannelId: message.member.voice.channelId,
      executor: { id: message.author.id },
    });
    const queue = await this.queryBus.execute(query);

    const nowPlaying = queue?.nowPlaying;
    if (!nowPlaying) return;

    const { playedYoutubeVideoId, title } = nowPlaying.mediaSource;
    if (!playedYoutubeVideoId) return;

    const video = await this.youtubeiProvider.getVideo(playedYoutubeVideoId);
    if (!video) return;

    const mediaSources = video.related.map(MediaSource.fromYoutube);

    await message.reply({
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>({
          components: [
            new StringSelectMenuBuilder()
              .setCustomId(MEDIA_SOURCE_SELECT_INTERACTION)
              .setPlaceholder(`Songs related with ${title}`.substring(0, 150))
              .setOptions(mediaSources.map(DiscordUtil.sourceToSelectOption)),
          ],
        }),
      ],
    });
  }
}
