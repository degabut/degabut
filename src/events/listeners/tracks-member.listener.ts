import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { MemberDto, TrackDto } from "@queue/dtos";
import { QueueClearedEvent, TracksAddedEvent, TracksRemovedEvent } from "@queue/events";

const events = [TracksAddedEvent, TracksRemovedEvent, QueueClearedEvent];
type Events = InstanceType<(typeof events)[number]>;

@EventsHandler(...events)
export class TracksMemberListener implements IEventHandler<Events> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: Events): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const { member } = event;
    const tracks = "tracks" in event ? event.tracks : event.queue.tracks;
    const queue = "queue" in event ? event.queue : tracks[0].queue;
    const memberIds = queue.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, eventName, {
      tracks: tracks.map(TrackDto.create),
      member: MemberDto.create(member),
    });
  }
}
