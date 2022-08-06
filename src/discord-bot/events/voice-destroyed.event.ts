import { QueuePlayer } from "@discord-bot/entities";

export class VoiceDestroyedEvent {
  public readonly player!: QueuePlayer;

  constructor(params: VoiceDestroyedEvent) {
    Object.assign(this, params);
  }
}
