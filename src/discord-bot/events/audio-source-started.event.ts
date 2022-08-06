import { Track } from "@queue/entities";

export class AudioSourceStartedEvent {
  public readonly track!: Track;

  constructor(params: AudioSourceStartedEvent) {
    Object.assign(this, params);
  }
}
