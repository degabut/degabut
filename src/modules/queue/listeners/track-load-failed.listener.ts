import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackLoadFailedEvent } from "@queue-player/events";

@EventsHandler(TrackLoadFailedEvent)
export class TrackLoadFailedListener implements IEventHandler<TrackLoadFailedEvent> {
  constructor(private readonly eventBus: EventBus) {}

  public async handle({ track }: TrackLoadFailedEvent): Promise<void> {
    const queue = track.queue;
    queue.removeTrack({ trackId: track.id });
    queue.processQueue();
  }
}
