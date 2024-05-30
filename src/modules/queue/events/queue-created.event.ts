import { Queue } from "@queue/entities";

export class QueueCreatedEvent {
  public readonly queue!: Queue;

  constructor(params: QueueCreatedEvent) {
    Object.assign(this, params);
  }
}
