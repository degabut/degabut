import { Queue } from "@queue/entities";

export class QueueProcessedEvent {
  public readonly queue!: Queue;

  constructor(params: QueueProcessedEvent) {
    Object.assign(this, params);
  }
}
