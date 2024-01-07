import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueVoiceChannelChangedEvent } from "@queue/events";

@EventsHandler(QueueVoiceChannelChangedEvent)
export class QueueVoiceChannelChangedListener
  implements IEventHandler<QueueVoiceChannelChangedEvent>
{
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: QueueVoiceChannelChangedEvent): Promise<void> {
    const { queue } = event;
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(memberIds, "queue-voice-channel-changed", {
      voiceChannel: queue.voiceChannel,
      voiceChannelId: queue.voiceChannelId,
    });
  }
}
