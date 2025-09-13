import { Queue, Track } from "@queue/entities";

export class QueueProcessedEvent {
  public readonly queue!: Queue;
  public readonly track!: Track | null;

  constructor(params: QueueProcessedEvent) {
    Object.assign(this, params);
  }
}
