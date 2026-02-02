import { QueuePlayer } from "@queue-player/entities";
import { Member } from "@queue/entities";

export class TrackSeekedEvent {
  public readonly position!: number;
  public readonly member!: Member;
  public readonly player!: QueuePlayer;

  constructor(params: TrackSeekedEvent) {
    Object.assign(this, params);
  }
}
