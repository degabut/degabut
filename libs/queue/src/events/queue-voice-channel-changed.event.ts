import { Queue, VoiceChannel } from "@queue/entities";

export class QueueVoiceChannelChangedEvent {
  public readonly queue!: Queue;
  public readonly from!: VoiceChannel;
  public readonly to!: VoiceChannel;

  constructor(params: QueueVoiceChannelChangedEvent) {
    Object.assign(this, params);
  }
}
