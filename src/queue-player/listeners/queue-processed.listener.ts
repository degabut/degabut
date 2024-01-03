import { DiscordUtil } from "@common/utils";
import { MediaSourceService } from "@media-source/services";
import { Logger } from "@nestjs/common";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackLoadFailedEvent } from "@queue-player/events";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueuePlayerService } from "@queue-player/services";
import { QueueProcessedEvent } from "@queue/events";
import { YoutubeCachedService } from "@youtube/services";
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
    private readonly youtubeService: YoutubeCachedService,
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

      const { youtubeVideo, spotifyTrack, playedYoutubeVideoId } = queue.nowPlaying.mediaSource;

      const videoId = youtubeVideo?.id || playedYoutubeVideoId;
      if (videoId) {
        res = await player.audioPlayer.node.rest.loadTracks(videoId);
        queue.nowPlaying.mediaSource.playedYoutubeVideoId = videoId;
      } else if (spotifyTrack) {
        const { name, artists, duration } = spotifyTrack;

        let keyword = name;
        if (artists) keyword += ` ${artists.map((a) => a.name).join(" ")}`;

        const video = await this.youtubeService.searchOneVideo(keyword, duration);
        if (video) {
          queue.nowPlaying.mediaSource.playedYoutubeVideoId = video.id;
          res = await player.audioPlayer.node.rest.loadTracks(video.id);
        }
      }

      await this.mediaSourceService.storeSource(queue.nowPlaying.mediaSource);

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
}
