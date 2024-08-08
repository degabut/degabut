import { Member, Queue } from "@queue/entities";

export class MemberUpdatedEvent {
  public readonly member!: Member;
  public readonly queue!: Queue;

  constructor(params: MemberUpdatedEvent) {
    Object.assign(this, params);
  }
}
