import { TrackAudioEndedEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueService } from "@queue/services";

@EventsHandler(TrackAudioEndedEvent)
export class TrackAudioEndedHandler implements IEventHandler<TrackAudioEndedEvent> {
  constructor(private readonly queueService: QueueService) {}

  public async handle({ track }: TrackAudioEndedEvent): Promise<void> {
    const queue = track.queue;
    if (queue.shuffle) queue.shuffleHistoryIds.push(track.id);
    track.playedAt = null;
    this.queueService.processQueue(track.queue);
  }
}
