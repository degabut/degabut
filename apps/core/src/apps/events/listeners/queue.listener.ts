import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueDto } from "@queue/dtos";
import { QueueCreatedEvent } from "@queue/events";

import { EventsGateway } from "../events.gateway";

@EventsHandler(QueueCreatedEvent)
export class QueueListener implements IEventHandler<QueueCreatedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: QueueCreatedEvent): Promise<void> {
    const { queue } = event;
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(memberIds, "queue-created", QueueDto.create(queue));
  }
}
