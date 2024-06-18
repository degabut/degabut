import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueLoopModeChangedEvent } from "@queue/events";

@EventsHandler(QueueLoopModeChangedEvent)
export class QueueLoopModeChangedListener implements IEventHandler<QueueLoopModeChangedEvent> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: QueueLoopModeChangedEvent): Promise<void> {
    const { queue } = event;
    const memberIds = queue.voiceChannel.activeMembers.map((m) => m.id);

    this.gateway.send(memberIds, "queue-loop-mode-changed", { loopMode: queue.loopMode });
  }
}
