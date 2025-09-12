import { DiscordUtil, TimeUtil } from "@common/utils";
import { Logger } from "@logger/logger.service";
import { MAX_PLAYED_YOUTUBE_VIDEO_ID_AGE } from "@media-source/media-source.constants";
import { MediaSourceService } from "@media-source/services";
import { Inject } from "@nestjs/common";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackLoadFailedEvent } from "@queue-player/events";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueuePlayerService } from "@queue-player/services";
import { QueueProcessedEvent } from "@queue/events";
import { SpotifyTrack } from "@spotify/entities";
import { IYoutubeiMusicProvider } from "@youtube/providers";
import { YOUTUBEI_MUSIC_PROVIDER } from "@youtube/youtube.constants";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
} from "discord.js";

@EventsHandler(QueueProcessedEvent)
export class QueueProcessedListener implements IEventHandler<QueueProcessedEvent> {
  constructor(
    private readonly eventBus: EventBus,
    @Inject(YOUTUBEI_MUSIC_PROVIDER)
    private readonly youtubeMusicProvider: IYoutubeiMusicProvider,
    private readonly playerRepository: QueuePlayerRepository,
    private readonly playerService: QueuePlayerService,
    private readonly mediaSourceService: MediaSourceService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(QueueProcessedListener.name);
  }

  public async handle({ queue }: QueueProcessedEvent) {
    const player = this.playerRepository.getByVoiceChannelId(queue.voiceChannelId);
    if (!player) return;

    if (!queue.nowPlaying) player.audioPlayer.stop();
    else {
      const currentMediaSource = queue.nowPlaying.mediaSource;
      const { youtubeVideo, spotifyTrack } = currentMediaSource;

      if (youtubeVideo) {
        currentMediaSource.playedYoutubeVideoId = youtubeVideo.id;
      } else if (spotifyTrack) {
        if (!currentMediaSource.playedYoutubeVideoId) {
          const mediaSource = await this.mediaSourceService.getSource({
            mediaSourceId: currentMediaSource.id,
          });
          if (mediaSource?.playedYoutubeVideoId) {
            currentMediaSource.playedYoutubeVideoId = mediaSource.playedYoutubeVideoId;
            currentMediaSource.updatedAt = mediaSource.updatedAt;
          }
        }

        if (
          !currentMediaSource.playedYoutubeVideoId ||
          TimeUtil.getSecondDifference(currentMediaSource.updatedAt, new Date()) >
            MAX_PLAYED_YOUTUBE_VIDEO_ID_AGE
        ) {
          const videoId = await this.findYouTubeVideoId(spotifyTrack);

          if (videoId) {
            currentMediaSource.playedYoutubeVideoId = videoId;
            currentMediaSource.updatedAt = new Date();
          }
        }
      }

      await this.mediaSourceService.storeSource(currentMediaSource);

      if (!currentMediaSource.playedYoutubeVideoId) {
        const error = {
          error: "Track load failed",
          message: `Can't find youtube video id for ${currentMediaSource.id}`,
        };
        this.logger.error(error);
        const event = new TrackLoadFailedEvent({
          track: queue.nowPlaying,
          error: error.message,
        });
        return this.eventBus.publish(event);
      }

      player.currentTrack = queue.nowPlaying;

      try {
        await player.audioPlayer.play(currentMediaSource.playedYoutubeVideoId);
        if (!queue.tracks.find((t) => t.id === player.currentTrack?.id)) {
          this.logger.info({
            method: "handle",
            message: "Track play cancelled, track no longer exists in queue",
          });
          return await player.audioPlayer.stop();
        }
      } catch (err: any) {
        this.logger.error({ error: "Track load failed", message: err.message });
        const event = new TrackLoadFailedEvent({
          track: queue.nowPlaying,
          error: err.message,
        });
        return this.eventBus.publish(event);
      }

      await this.playerService.notify(
        player,
        {
          content: "🎶 **Now Playing**",
          embeds: [DiscordUtil.trackToEmbed(queue.nowPlaying)],
          components: [
            new ActionRowBuilder<MessageActionRowComponentBuilder>({
              components: [
                new ButtonBuilder({
                  customId: "skip",
                  label: "Skip",
                  style: ButtonStyle.Secondary,
                }),
                new ButtonBuilder({
                  customId: `remove-track/${queue.nowPlaying.id}`,
                  label: "Remove",
                  style: ButtonStyle.Danger,
                }),
              ],
            }),
          ],
        },
        "NOW_PLAYING",
      );
    }
  }

  private async findYouTubeVideoId(spotifyTrack: SpotifyTrack) {
    const { name, artists } = spotifyTrack;

    let keyword = name;
    if (artists) keyword += ` ${artists.map((a) => a.name).join(" ")}`;
    const songs = await this.youtubeMusicProvider.searchAll(keyword);

    if (songs.top?.item && "duration" in songs.top.item) return songs.top.item.id;

    return songs.shelves
      .find((s) => {
        const item = s.items.at(0);
        if (!item) return false;
        return "duration" in item;
      })
      ?.items.at(0)?.id;
  }
}
