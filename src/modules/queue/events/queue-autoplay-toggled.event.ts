import { Member, Queue } from "@queue/entities";

export class QueueAutoplayToggledEvent {
  public readonly queue!: Queue;
  public readonly member!: Member;

  constructor(params: QueueAutoplayToggledEvent) {
    Object.assign(this, params);
  }
}
