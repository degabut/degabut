import { Member, Queue, Track } from "@queue/entities";

export class TracksAddedEvent {
  public readonly queue!: Queue;
  public readonly tracks!: Track[];
  public readonly member!: Member | null;

  constructor(params: TracksAddedEvent) {
    Object.assign(this, params);
  }
}
