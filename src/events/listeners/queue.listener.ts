import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueDto } from "@queue/dtos";
import { QueueCreatedEvent } from "@queue/events";

@EventsHandler(QueueCreatedEvent)
export class QueueListener implements IEventHandler<QueueCreatedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: QueueCreatedEvent): Promise<void> {
    const { queue } = event;
    const memberIds = queue.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, "queue-created", QueueDto.create(queue));
  }
}
