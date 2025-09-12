import { Track } from "@queue/entities";

export class TrackLoadFailedEvent {
  public readonly track!: Track;
  public readonly error?: string;

  constructor(params: TrackLoadFailedEvent) {
    Object.assign(this, params);
  }
}
