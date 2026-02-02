import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackOrderChangedEvent } from "@queue/events";

@EventsHandler(TrackOrderChangedEvent)
export class TrackOrderChangedListener implements IEventHandler<TrackOrderChangedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: TrackOrderChangedEvent): Promise<void> {
    const { track } = event;
    const queue = track.queue;
    const trackIds = queue.tracks.map((t) => t.id);
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(memberIds, "track-order-changed", trackIds, queue.voiceChannelId);
  }
}
