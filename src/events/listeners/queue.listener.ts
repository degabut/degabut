import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueDto } from "@queue/dtos";
import { QueueCreatedEvent } from "@queue/events";

const events = [QueueCreatedEvent];
type Events = InstanceType<typeof events[number]>;

@EventsHandler(...events)
export class QueueListener implements IEventHandler<Events> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: Events): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const { queue } = event;
    const memberIds = queue.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, eventName, QueueDto.create(queue));
  }
}
