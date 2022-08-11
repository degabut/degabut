import { Queue } from "@queue/entities";

export class QueuePauseStateChangedEvent {
  public readonly queue!: Queue;

  constructor(params: QueuePauseStateChangedEvent) {
    Object.assign(this, params);
  }
}
