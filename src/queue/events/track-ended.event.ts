import { Track } from "@queue/entities";

export class TrackEndedEvent {
  public readonly track!: Track;

  constructor(params: TrackEndedEvent) {
    Object.assign(this, params);
  }
}
