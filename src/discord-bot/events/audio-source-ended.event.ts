import { Track } from "@queue/entities";

export class AudioSourceEndedEvent {
  public readonly track!: Track;

  constructor(params: AudioSourceEndedEvent) {
    Object.assign(this, params);
  }
}
