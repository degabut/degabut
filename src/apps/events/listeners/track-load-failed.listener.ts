import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackLoadFailedEvent } from "@queue-player/events";
import { TrackDto } from "@queue/dtos";
import { QueueProcessedEvent } from "@queue/events";

@EventsHandler(TrackLoadFailedEvent)
export class TrackLoadFailedListener implements IEventHandler<TrackLoadFailedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: TrackLoadFailedEvent): Promise<void> {
    const queue = event instanceof QueueProcessedEvent ? event.queue : event.track.queue;
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(memberIds, "track-load-failed", {
      track: TrackDto.create(event.track),
      error: event.error,
    });
  }
}
