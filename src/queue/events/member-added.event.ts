import { Member, Queue } from "@queue/entities";

export class MemberAddedEvent {
  public readonly member!: Member;
  public readonly queue!: Queue;

  constructor(params: MemberAddedEvent) {
    Object.assign(this, params);
  }
}
