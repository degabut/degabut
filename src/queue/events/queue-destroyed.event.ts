import { Queue } from "@queue/entities";

export class QueueDestroyedEvent {
  public readonly queue!: Queue;

  constructor(params: QueueDestroyedEvent) {
    Object.assign(this, params);
  }
}
