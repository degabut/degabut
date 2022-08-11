import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueDto } from "@queue/dtos";
import {
  MemberAddedEvent,
  MemberRemovedEvent,
  MemberUpdatedEvent,
  QueueClearedEvent,
  QueueCreatedEvent,
  QueueDestroyedEvent,
  QueueLoopTypeChangedEvent,
  QueuePausedEvent,
  QueueProcessedEvent,
  QueueShuffleToggledEvent,
  TrackAddedEvent,
  TrackOrderChangedEvent,
  TrackRemovedEvent,
  TrackSkippedEvent,
} from "@queue/events";

import { EventsGateway } from "../events.gateway";

const events = [
  QueueCreatedEvent,
  QueueDestroyedEvent,
  QueueProcessedEvent,
  QueuePausedEvent,
  QueueLoopTypeChangedEvent,
  QueueShuffleToggledEvent,
  QueueClearedEvent,
  TrackAddedEvent,
  TrackRemovedEvent,
  TrackSkippedEvent,
  TrackOrderChangedEvent,
  MemberAddedEvent,
  MemberRemovedEvent,
  MemberUpdatedEvent,
];
type Events = InstanceType<typeof events[number]>;

@EventsHandler(...events)
export class QueueUpdatedHandler implements IEventHandler<Events> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: Events): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const queue = "queue" in event ? event.queue : event.track.queue;
    const memberIds = queue.voiceChannel.members.map((m) => m.id);

    // TODO optimize payload (don't send entire queue object)
    this.gateway.send(memberIds, eventName, QueueDto.create(queue));
  }
}
