import { JamCollection, Queue } from "@queue/entities";

export class MemberJammedEvent {
  public readonly jam!: JamCollection;
  public readonly queue!: Queue;

  constructor(params: MemberJammedEvent) {
    Object.assign(this, params);
  }
}
