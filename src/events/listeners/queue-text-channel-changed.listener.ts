import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueTextChannelChangedEvent } from "@queue/events";

@EventsHandler(QueueTextChannelChangedEvent)
export class QueueTextChannelChangedListener
  implements IEventHandler<QueueTextChannelChangedEvent>
{
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: QueueTextChannelChangedEvent): Promise<void> {
    const { queue } = event;
    const memberIds = queue.voiceChannel.members.map((m) => m.id);

    this.gateway.send(memberIds, "queue-text-channel-changed", { textChannel: queue.textChannel });
  }
}
