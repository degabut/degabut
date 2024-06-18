import { QueuePlayer } from "@queue-player/entities";

export class PlayerTickEvent {
  public readonly player!: QueuePlayer;
  public readonly position!: number | null;

  constructor(params: PlayerTickEvent) {
    Object.assign(this, params);
  }
}
