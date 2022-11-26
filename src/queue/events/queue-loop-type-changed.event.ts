import { Member, Queue } from "@queue/entities";

export class QueueLoopTypeChangedEvent {
  public readonly queue!: Queue;
  public readonly member!: Member;

  constructor(params: QueueLoopTypeChangedEvent) {
    Object.assign(this, params);
  }
}
