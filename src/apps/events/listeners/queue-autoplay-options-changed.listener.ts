import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueAutoplayOptionsChangedEvent } from "@queue/events";

@EventsHandler(QueueAutoplayOptionsChangedEvent)
export class QueueAutoplayOptionsChangedListener
  implements IEventHandler<QueueAutoplayOptionsChangedEvent>
{
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: QueueAutoplayOptionsChangedEvent): Promise<void> {
    const { queue } = event;
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(memberIds, "queue-autoplay-options-changed", {
      autoplayOptions: queue.autoplayOptions,
    });
  }
}
