import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueService } from "@queue/services";

import { TrackEndedEvent, TrackSkippedEvent } from "../events";

@EventsHandler(TrackEndedEvent, TrackSkippedEvent)
export class TrackEndedHandler implements IEventHandler<TrackEndedEvent> {
  constructor(private readonly queueService: QueueService) {}

  public async handle({ track }: TrackEndedEvent): Promise<void> {
    const queue = track.queue;
    if (queue.shuffle) queue.shuffleHistoryIds.push(track.id);
    this.queueService.processQueue(track.queue);
  }
}
