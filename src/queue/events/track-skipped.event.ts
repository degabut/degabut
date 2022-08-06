import { Track } from "@queue/entities";

export class TrackSkippedEvent {
  public readonly track!: Track;
  public readonly skippedBy?: string;

  constructor(params: TrackSkippedEvent) {
    Object.assign(this, params);
  }
}
