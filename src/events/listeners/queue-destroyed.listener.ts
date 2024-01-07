import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueDestroyedEvent } from "@queue/events";

@EventsHandler(QueueDestroyedEvent)
export class QueueDestroyedListener implements IEventHandler<QueueDestroyedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: QueueDestroyedEvent): Promise<void> {
    const { queue } = event;
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(memberIds, "queue-destroyed", {});
  }
}
