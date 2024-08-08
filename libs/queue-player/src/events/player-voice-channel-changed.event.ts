import { QueuePlayer } from "@queue-player/entities";

export class PlayerVoiceChannelChangedEvent {
  public readonly player!: QueuePlayer;

  constructor(params: PlayerVoiceChannelChangedEvent) {
    Object.assign(this, params);
  }
}
