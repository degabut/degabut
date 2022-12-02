import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { TrackMarkedPlayNextEvent } from "@queue/events";

@EventsHandler(TrackMarkedPlayNextEvent)
export class TrackMarkedPlayNextListener implements IEventHandler<TrackMarkedPlayNextEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ track }: TrackMarkedPlayNextEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player || !player.audioPlayer.playing) return;

    player.audioPlayer.stop();
  }
}
