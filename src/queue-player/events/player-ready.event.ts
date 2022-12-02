import { QueuePlayer } from "@queue-player/entities";

export class PlayerReadyEvent {
  public readonly player!: QueuePlayer;

  constructor(params: PlayerReadyEvent) {
    Object.assign(this, params);
  }
}
