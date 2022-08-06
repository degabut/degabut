import { Queue } from "@queue/entities";

export class QueuePausedEvent {
  public readonly queue!: Queue;

  constructor(params: QueuePausedEvent) {
    Object.assign(this, params);
  }
}
