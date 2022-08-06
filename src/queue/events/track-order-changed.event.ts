import { Track } from "@queue/entities";

export class TrackOrderChangedEvent {
  public readonly track!: Track;
  public readonly to!: number;

  constructor(params: TrackOrderChangedEvent) {
    Object.assign(this, params);
  }
}
