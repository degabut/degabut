import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { MemberDto } from "@queue/dtos";
import { MemberJoinedEvent, MemberLeftEvent, MemberUpdatedEvent } from "@queue/events";

const events = [MemberJoinedEvent, MemberLeftEvent, MemberUpdatedEvent];
type Events = InstanceType<(typeof events)[number]>;

@EventsHandler(...events)
export class MemberListener implements IEventHandler<Events> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: Events): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const { queue, member } = event;
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(memberIds, eventName, MemberDto.create(member));
  }
}
