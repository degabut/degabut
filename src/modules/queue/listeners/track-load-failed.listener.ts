import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackLoadFailedEvent } from "@queue-player/events";

@EventsHandler(TrackLoadFailedEvent)
export class TrackLoadFailedListener implements IEventHandler<TrackLoadFailedEvent> {
  public async handle({ track, error }: TrackLoadFailedEvent): Promise<void> {
    const queue = track.queue;
    track.setError(error || "Unknown error");
    queue.processQueue();
  }
}
