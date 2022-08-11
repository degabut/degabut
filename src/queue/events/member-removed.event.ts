import { Member, Queue } from "@queue/entities";

export class MemberRemovedEvent {
  public readonly member!: Member;
  public readonly queue!: Queue;

  constructor(params: MemberRemovedEvent) {
    Object.assign(this, params);
  }
}
