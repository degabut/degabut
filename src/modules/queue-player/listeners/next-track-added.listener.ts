import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { NextTrackAddedEvent } from "@queue/events";

@EventsHandler(NextTrackAddedEvent)
export class NextTrackAddedListener implements IEventHandler<NextTrackAddedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ track, playNow }: NextTrackAddedEvent): Promise<void> {
    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!playNow || !player || !player.audioPlayer.isPlaying) return;

    player.audioPlayer.stop();
  }
}
