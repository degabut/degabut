import { Track } from "@queue/entities";

export class TrackStartedEvent {
  public readonly track!: Track;

  constructor(params: TrackStartedEvent) {
    Object.assign(this, params);
  }
}
