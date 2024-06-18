import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackAudioEndedEvent } from "@queue-player/events";

@EventsHandler(TrackAudioEndedEvent)
export class TrackAudioEndedListener implements IEventHandler<TrackAudioEndedEvent> {
  public async handle({ track }: TrackAudioEndedEvent): Promise<void> {
    track.queue.processQueue();
  }
}
