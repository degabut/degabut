import { QueuePlayer } from "@discord-bot/entities";

export class PlayerTickEvent {
  public readonly player!: QueuePlayer;
  public readonly position!: number | null;

  constructor(params: PlayerTickEvent) {
    Object.assign(this, params);
  }
}
