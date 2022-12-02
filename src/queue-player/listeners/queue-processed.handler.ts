import { DiscordUtil } from "@common/utils";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueueProcessedEvent } from "@queue/events";

@EventsHandler(QueueProcessedEvent)
export class QueueProcessedHandler implements IEventHandler<QueueProcessedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ queue }: QueueProcessedEvent) {
    const player = this.playerRepository.getByVoiceChannelId(queue.voiceChannelId);
    if (!player) return;

    if (!queue.nowPlaying) player.audioPlayer.stop();
    else {
      const res = await player.audioPlayer.node.rest.loadTracks(queue.nowPlaying.video.id);
      const [track] = res.tracks;
      if (!track) return;

      player.currentTrack = {
        id: track.track,
        track: queue.nowPlaying,
      };

      await Promise.all([
        player.audioPlayer.play(track),
        player.notify({
          content: "🎶 **Now Playing**",
          embeds: [DiscordUtil.trackToEmbed(queue.nowPlaying)],
        }),
      ]);
    }
  }
}
