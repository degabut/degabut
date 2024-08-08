import { Member, Queue } from "@queue/entities";

export class MemberJoinedEvent {
  public readonly member!: Member;
  public readonly queue!: Queue;

  constructor(params: MemberJoinedEvent) {
    Object.assign(this, params);
  }
}
