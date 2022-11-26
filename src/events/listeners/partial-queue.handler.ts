import { EventsGateway } from "@events/events.gateway";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueDto } from "@queue/dtos";
import {
  QueueDestroyedEvent,
  QueueLoopTypeChangedEvent,
  QueuePauseStateChangedEvent,
  QueueShuffleToggledEvent,
} from "@queue/events";

const events = [
  QueueDestroyedEvent,
  QueuePauseStateChangedEvent,
  QueueLoopTypeChangedEvent,
  QueueShuffleToggledEvent,
];
type Events = InstanceType<typeof events[number]>;

@EventsHandler(...events)
export class PartialQueueHandler implements IEventHandler<Events> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: Events): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const { queue } = event;
    const memberIds = queue.voiceChannel.members.map((m) => m.id);

    const queueDto = QueueDto.create(queue);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tracks, history, voiceChannel, ...baseQueue } = queueDto;

    this.gateway.send(memberIds, eventName, baseQueue);
  }
}
