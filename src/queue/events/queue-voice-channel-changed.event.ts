import { Queue } from "@queue/entities";

export class QueueVoiceChannelChangedEvent {
  public readonly queue!: Queue;

  constructor(params: QueueVoiceChannelChangedEvent) {
    Object.assign(this, params);
  }
}
