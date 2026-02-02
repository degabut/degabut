import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueVoiceChannelChangedEvent } from "@queue/events";

@EventsHandler(QueueVoiceChannelChangedEvent)
export class QueueVoiceChannelChangedListener
  implements IEventHandler<QueueVoiceChannelChangedEvent>
{
  constructor(private readonly gateway: EventsGateway) {}

  public async handle({ from, to }: QueueVoiceChannelChangedEvent): Promise<void> {
    const fromMemberIds = from.members.map((m) => m.id);
    const toMemberIds = to.members.map((m) => m.id);

    this.gateway.send(fromMemberIds, "queue-left", { voiceChannelId: from.id }, from.id);
    this.gateway.send(toMemberIds, "queue-joined", { voiceChannelId: to.id }, to.id);
  }
}
