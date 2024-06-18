import { Track } from "@queue/entities";

export class TrackAudioStartedEvent {
  public readonly track!: Track;

  constructor(params: TrackAudioStartedEvent) {
    Object.assign(this, params);
  }
}
