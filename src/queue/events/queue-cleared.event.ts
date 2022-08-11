import { Queue } from "@queue/entities";

export class QueueClearedEvent {
  public readonly queue!: Queue;

  constructor(params: QueueClearedEvent) {
    Object.assign(this, params);
  }
}
