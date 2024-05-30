import { Member, Track } from "@queue/entities";

export class TrackRemovedEvent {
  public readonly track!: Track;
  public readonly member?: Member;
  public readonly isNowPlaying!: boolean;

  constructor(params: TrackRemovedEvent) {
    Object.assign(this, params);
  }
}
