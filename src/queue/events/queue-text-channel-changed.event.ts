import { Queue } from "@queue/entities";

export class QueueTextChannelChangedEvent {
  public readonly queue!: Queue;

  constructor(params: QueueTextChannelChangedEvent) {
    Object.assign(this, params);
  }
}
