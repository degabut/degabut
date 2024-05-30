import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackAudioEndedEvent } from "@queue-player/events";
import { QueueService } from "@queue/services";

@EventsHandler(TrackAudioEndedEvent)
export class TrackAudioEndedListener implements IEventHandler<TrackAudioEndedEvent> {
  constructor(private readonly queueService: QueueService) {}

  public async handle({ track }: TrackAudioEndedEvent): Promise<void> {
    const queue = track.queue;
    if (queue.shuffle) queue.shuffleHistoryIds.push(track.id);
    track.playedAt = null;
    this.queueService.processQueue(track.queue);
  }
}
