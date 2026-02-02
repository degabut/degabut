import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueShuffleToggledEvent } from "@queue/events";

@EventsHandler(QueueShuffleToggledEvent)
export class QueueShuffleToggledListener implements IEventHandler<QueueShuffleToggledEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: QueueShuffleToggledEvent): Promise<void> {
    const { queue } = event;
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(memberIds, "queue-shuffle-toggled", { shuffle: queue.shuffle }, queue.voiceChannelId);
  }
}
