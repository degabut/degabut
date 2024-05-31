import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackAudioEndedEvent } from "@queue-player/events";
import { QueueService } from "@queue/services";

@EventsHandler(TrackAudioEndedEvent)
export class TrackAudioEndedListener implements IEventHandler<TrackAudioEndedEvent> {
  constructor(private readonly queueService: QueueService) {}

  public async handle({ track }: TrackAudioEndedEvent): Promise<void> {
    const queue = track.queue;

    queue.historyIds.push(track.id);
    if (!queue.unplayedTrack.length) {
      queue.previousHistoryIds = [...queue.historyIds];
      queue.historyIds = [track.id];
    }

    // TODO remove non existent & duplicate tracks from history

    track.playedAt = null;
    this.queueService.processQueue(track.queue);
  }
}
