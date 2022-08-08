import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueueDto } from "@queue/dtos";
import {
  QueueProcessedEvent,
  TrackAddedEvent,
  TrackOrderChangedEvent,
  TrackRemovedEvent,
} from "@queue/events";

import { EventsGateway } from "../events.gateway";

const events = [QueueProcessedEvent, TrackAddedEvent, TrackRemovedEvent, TrackOrderChangedEvent];
type Events = InstanceType<typeof events[number]>;

@EventsHandler(...events)
export class QueueHandler implements IEventHandler<Events> {
  constructor(private readonly gateway: EventsGateway) {}

  public async handle(event: Events): Promise<void> {
    const eventName = event.constructor.name
      .replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)
      .replace(/^-(.*)-event$/, "$1");

    const queue = "queue" in event ? event.queue : event.track.queue;

    // TODO get queue members
    this.gateway.send([], eventName, QueueDto.create(queue));
  }
}
