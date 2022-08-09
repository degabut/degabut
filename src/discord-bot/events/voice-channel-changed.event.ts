import { QueuePlayer } from "@discord-bot/entities";

export class VoiceChannelChangedEvent {
  public readonly player!: QueuePlayer;

  constructor(params: VoiceChannelChangedEvent) {
    Object.assign(this, params);
  }
}
