import { Member, Queue } from "@queue/entities";

export class QueueClearedEvent {
  public readonly queue!: Queue;
  public readonly member!: Member;
  public readonly includeNowPlaying!: boolean;

  constructor(params: QueueClearedEvent) {
    Object.assign(this, params);
  }
}
