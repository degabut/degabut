import { QueuePlayer } from "@queue-player/entities";
import { Member } from "@queue/entities";

export class PlayerFiltersChangedEvent {
  public readonly player!: QueuePlayer;
  public readonly member!: Member;

  constructor(params: PlayerFiltersChangedEvent) {
    Object.assign(this, params);
  }
}
