import { Member, Queue } from "@queue/entities";

export class QueuePauseStateChangedEvent {
  public readonly queue!: Queue;
  public readonly member!: Member;

  constructor(params: QueuePauseStateChangedEvent) {
    Object.assign(this, params);
  }
}
