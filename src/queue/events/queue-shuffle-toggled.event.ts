import { Queue } from "@queue/entities";

export class QueueShuffleToggledEvent {
  public readonly queue!: Queue;

  constructor(params: QueueShuffleToggledEvent) {
    Object.assign(this, params);
  }
}
