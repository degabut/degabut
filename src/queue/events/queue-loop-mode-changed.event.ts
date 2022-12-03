import { Member, Queue } from "@queue/entities";

export class QueueLoopModeChangedEvent {
  public readonly queue!: Queue;
  public readonly member!: Member;

  constructor(params: QueueLoopModeChangedEvent) {
    Object.assign(this, params);
  }
}
