import { QueuePlayer } from "@queue-player/entities";

export class PlayerDestroyedEvent {
  public readonly player!: QueuePlayer;

  constructor(params: PlayerDestroyedEvent) {
    Object.assign(this, params);
  }
}
