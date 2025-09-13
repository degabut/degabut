import { AsyncUtil, SpotifyUtil, YoutubeUtil } from "@common/utils";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JoinCommand } from "@queue-player/commands";
import { AddTracksCommand } from "@queue/commands";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";

export type AddTrackOptions = {
  voiceChannel: BaseGuildVoiceChannel;
  userId: string;
  keyword?: string;
  mediaSourceId?: string;
};

export type JoinOptions = {
  voiceChannel: BaseGuildVoiceChannel;
  textChannel?: BaseGuildTextChannel;
  userId: string;
};

@Injectable()
export class DiscordBotService {
  constructor(private readonly commandBus: CommandBus) {}

  public async joinAndAddTrack(options: AddTrackOptions & JoinOptions) {
    try {
      return await this.addTrack(options);
    } catch (err) {
      if (!(err instanceof NotFoundException)) throw err;
      await this.join(options);
      await AsyncUtil.sleep(1000);
      return await this.addTrack(options);
    }
  }

  private async addTrack(options: AddTrackOptions) {
    if (!options.keyword && !options.mediaSourceId) {
      throw new NotFoundException("Keyword not found");
    }

    if (options.keyword) {
      const youtubeIds = YoutubeUtil.extractIds(options.keyword);
      const spotifyIds = SpotifyUtil.extractIds(options.keyword);

      if (youtubeIds.playlistId || spotifyIds.playlistId || spotifyIds.albumId) {
        const command = new AddTracksCommand({
          voiceChannelId: options.voiceChannel.id,
          youtubePlaylistId: youtubeIds.playlistId,
          spotifyPlaylistId: spotifyIds.playlistId,
          spotifyAlbumId: spotifyIds.albumId,
          executor: { id: options.userId },
        });
        return await this.commandBus.execute(command);
      } else {
        const mediaSourceId = youtubeIds.videoId
          ? `youtube/${youtubeIds.videoId}`
          : spotifyIds.trackId
            ? `spotify/${spotifyIds.trackId}`
            : undefined;

        const command = new AddTracksCommand({
          voiceChannelId: options.voiceChannel.id,
          mediaSourceId,
          youtubeKeyword: mediaSourceId ? undefined : options.keyword,
          executor: { id: options.userId },
        });
        return await this.commandBus.execute(command);
      }
    } else {
      const command = new AddTracksCommand({
        voiceChannelId: options.voiceChannel.id,
        mediaSourceId: options.mediaSourceId,
        executor: { id: options.userId },
      });
      return await this.commandBus.execute(command);
    }
  }

  private async join(options: JoinOptions) {
    const command = new JoinCommand({
      voiceChannel: options.voiceChannel,
      textChannel: options.textChannel,
      executor: { id: options.userId },
    });

    await this.commandBus.execute(command);
  }
}
