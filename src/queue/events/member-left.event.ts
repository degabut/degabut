import { Member, Queue } from "@queue/entities";

export class MemberLeftEvent {
  public readonly member!: Member;
  public readonly queue!: Queue;

  constructor(params: MemberLeftEvent) {
    Object.assign(this, params);
  }
}
