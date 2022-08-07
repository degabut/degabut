import { Track } from "@queue/entities";

export class TrackAudioErrorEvent {
  public readonly track!: Track;

  constructor(params: TrackAudioErrorEvent) {
    Object.assign(this, params);
  }
}
