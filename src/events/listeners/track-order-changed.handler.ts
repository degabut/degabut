import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackOrderChangedEvent } from "@queue/events";

const events = [TrackOrderChangedEvent];
type Events = InstanceType<typeof events[number]>;

@EventsHandler(...events)
export class TrackOrderChangedHandler implements IEventHandler<Events> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: Events): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const { track } = event;
    const queue = track.queue;
    const trackIds = queue.tracks.map((t) => t.id);
    const memberIds = queue.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, eventName, trackIds);
  }
}
