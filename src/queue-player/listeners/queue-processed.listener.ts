import { DiscordUtil } from "@common/utils";
import { Logger } from "@nestjs/common";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackLoadFailedEvent } from "@queue-player/events";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueuePlayerService } from "@queue-player/services";
import { QueueProcessedEvent } from "@queue/events";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
} from "discord.js";

@EventsHandler(QueueProcessedEvent)
export class QueueProcessedListener implements IEventHandler<QueueProcessedEvent> {
  private logger = new Logger(QueueProcessedListener.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly playerRepository: QueuePlayerRepository,
    private readonly playerService: QueuePlayerService,
  ) {}

  public async handle({ queue }: QueueProcessedEvent) {
    const player = this.playerRepository.getByVoiceChannelId(queue.voiceChannelId);
    if (!player) return;

    if (!queue.nowPlaying) player.audioPlayer.stop();
    else {
      const res = await player.audioPlayer.node.rest.loadTracks(queue.nowPlaying.video.id);

      if (res.loadType !== "TRACK_LOADED") {
        this.logger.log({ error: "Track load failed", ...res });
        const event = new TrackLoadFailedEvent({ track: queue.nowPlaying });
        return this.eventBus.publish(event);
      }

      const [track] = res.tracks;
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
