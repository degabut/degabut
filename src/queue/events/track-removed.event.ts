import { Track } from "@queue/entities";

export class TrackRemovedEvent {
  public readonly track!: Track;
  public readonly removedBy!: string;
  public readonly isNowPlaying!: boolean;

  constructor(params: TrackRemovedEvent) {
    Object.assign(this, params);
  }
}
