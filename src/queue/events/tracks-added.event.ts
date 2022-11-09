import { Queue, Track } from "@queue/entities";

export class TracksAddedEvent {
  public readonly queue!: Queue;
  public readonly tracks!: Track[];

  constructor(params: TracksAddedEvent) {
    Object.assign(this, params);
  }
}
