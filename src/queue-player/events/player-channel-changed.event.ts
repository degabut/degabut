import { QueuePlayer } from "@queue-player/entities";

export class PlayerChannelChangedEvent {
  public readonly player!: QueuePlayer;

  constructor(params: PlayerChannelChangedEvent) {
    Object.assign(this, params);
  }
}
