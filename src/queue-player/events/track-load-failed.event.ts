import { Track } from "@queue/entities";

export class TrackLoadFailedEvent {
  public readonly track!: Track;

  constructor(params: TrackLoadFailedEvent) {
    Object.assign(this, params);
  }
}
