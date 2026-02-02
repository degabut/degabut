import { QueuePlayer } from "@queue-player/entities";
import { Member } from "@queue/entities";

export class PlayerPauseStateChangedEvent {
  public readonly player!: QueuePlayer;
  public readonly member!: Member;

  constructor(params: PlayerPauseStateChangedEvent) {
    Object.assign(this, params);
  }
}
