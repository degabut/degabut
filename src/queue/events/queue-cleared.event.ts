import { Member, Queue } from "@queue/entities";

export class QueueClearedEvent {
  public readonly queue!: Queue;
  public readonly member!: Member;

  constructor(params: QueueClearedEvent) {
    Object.assign(this, params);
  }
}
