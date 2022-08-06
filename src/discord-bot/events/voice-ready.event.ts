import { QueuePlayer } from "@discord-bot/entities";

export class VoiceReadyEvent {
  public readonly player!: QueuePlayer;

  constructor(params: VoiceReadyEvent) {
    Object.assign(this, params);
  }
}
