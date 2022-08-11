import { Queue } from "@queue/entities";

export class QueueLoopTypeChangedEvent {
  public readonly queue!: Queue;

  constructor(params: QueueLoopTypeChangedEvent) {
    Object.assign(this, params);
  }
}
