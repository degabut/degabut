import { Member, Queue } from "@queue/entities";

export class QueueAutoplayOptionsChangedEvent {
  public readonly queue!: Queue;
  public readonly member!: Member;

  constructor(params: QueueAutoplayOptionsChangedEvent) {
    Object.assign(this, params);
  }
}
