import { Track } from "@queue/entities";

export class TrackAudioEndedEvent {
  public readonly track!: Track;

  constructor(params: TrackAudioEndedEvent) {
    Object.assign(this, params);
  }
}
