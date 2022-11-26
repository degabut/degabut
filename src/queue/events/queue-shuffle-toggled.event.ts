import { Member, Queue } from "@queue/entities";

export class QueueShuffleToggledEvent {
  public readonly queue!: Queue;
  public readonly member!: Member;

  constructor(params: QueueShuffleToggledEvent) {
    Object.assign(this, params);
  }
}
