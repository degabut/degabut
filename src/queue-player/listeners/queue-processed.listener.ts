import { DiscordUtil, TimeUtil } from "@common/utils";
import { MAX_PLAYED_YOUTUBE_VIDEO_ID_AGE } from "@media-source/media-source.constants";
import { MediaSourceService } from "@media-source/services";
import { Inject, Logger } from "@nestjs/common";
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
import { REST } from "lavaclient";

export type LoadTrackResponse = Awaited<ReturnType<REST["loadTracks"]>>;

@EventsHandler(QueueProcessedEvent)
export class QueueProcessedListener implements IEventHandler<QueueProcessedEvent> {
  private logger = new Logger(QueueProcessedListener.name);

  constructor(
    private readonly eventBus: EventBus,
    @Inject(YOUTUBEI_MUSIC_PROVIDER)
    private readonly youtubeMusicProvider: IYoutubeiMusicProvider,
    private readonly playerRepository: QueuePlayerRepository,
    private readonly playerService: QueuePlayerService,
    private readonly mediaSourceService: MediaSourceService,
  ) {}

  public async handle({ queue }: QueueProcessedEvent) {
    const player = this.playerRepository.getByVoiceChannelId(queue.voiceChannelId);
    if (!player) return;

    if (!queue.nowPlaying) player.audioPlayer.stop();
    else {
      let res: LoadTrackResponse | null = null;

      const currentMediaSource = queue.nowPlaying.mediaSource;
      const { youtubeVideo, spotifyTrack } = currentMediaSource;

      if (youtubeVideo) {
        res = await player.audioPlayer.node.rest.loadTracks(youtubeVideo.id);
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
            res = await player.audioPlayer.node.rest.loadTracks(videoId);
          }
        }

        if (currentMediaSource.playedYoutubeVideoId) {
          res = await player.audioPlayer.node.rest.loadTracks(
            currentMediaSource.playedYoutubeVideoId,
          );
        }
      }

      await this.mediaSourceService.storeSource(currentMediaSource);

      if (res?.loadType !== "TRACK_LOADED") {
        if (res) this.logger.log({ error: "Track load failed", ...res });
        else
          this.logger.log({ error: "Track load failed", exception: new Error("Track not found") });

        const event = new TrackLoadFailedEvent({ track: queue.nowPlaying });
        return this.eventBus.publish(event);
      }

      const track = res.tracks.at(0);
      if (!track) return;

      player.currentTrack = {
        id: track.track,
        track: queue.nowPlaying,
      };

      await Promise.all([
        player.audioPlayer.play(track),
        this.playerService.notify(
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
        ),
      ]);
    }
  }

  private async findYouTubeVideoId(spotifyTrack: SpotifyTrack) {
    const { name, artists } = spotifyTrack;

    let keyword = name;
    if (artists) keyword += ` ${artists.map((a) => a.name).join(" ")}`;
    const songs = await this.youtubeMusicProvider.searchSong(keyword);

    return songs.at(0)?.id;
  }
}
