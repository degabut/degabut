import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueAutoplayToggledEvent } from "@queue/events";

@EventsHandler(QueueAutoplayToggledEvent)
export class QueueAutoplayToggledListener implements IEventHandler<QueueAutoplayToggledEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: QueueAutoplayToggledEvent): Promise<void> {
    const { queue } = event;
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(memberIds, "queue-autoplay-toggled", { autoplay: queue.autoplay }, queue.voiceChannelId);
  }
}
