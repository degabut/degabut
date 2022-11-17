import { Track } from "@queue/entities";

export class TrackAudioFinishedEvent {
  public readonly track!: Track;

  constructor(params: TrackAudioFinishedEvent) {
    Object.assign(this, params);
  }
}
