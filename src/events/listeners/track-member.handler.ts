import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { MemberDto, TrackDto } from "@queue/dtos";
import { TrackAddedEvent, TrackRemovedEvent, TrackSkippedEvent } from "@queue/events";

const events = [TrackAddedEvent, TrackRemovedEvent, TrackSkippedEvent];
type Events = InstanceType<typeof events[number]>;

@EventsHandler(...events)
export class TrackMemberHandler implements IEventHandler<Events> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: Events): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const { track, member } = event;
    const queue = track.queue;
    const memberIds = queue.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, eventName, {
      track: TrackDto.create(track),
      member: member ? MemberDto.create(member) : null,
    });
  }
}
