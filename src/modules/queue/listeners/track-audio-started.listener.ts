import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackAudioStartedEvent } from "@queue-player/events";

@EventsHandler(TrackAudioStartedEvent)
export class TrackAudioStartedListener implements IEventHandler<TrackAudioStartedEvent> {
  public async handle({ track }: TrackAudioStartedEvent): Promise<void> {
    track.playedAt = new Date();
  }
}
