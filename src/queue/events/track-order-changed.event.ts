import { Member, Track } from "@queue/entities";

export class TrackOrderChangedEvent {
  public readonly track!: Track;
  public readonly to!: number;
  public readonly member!: Member;

  constructor(params: TrackOrderChangedEvent) {
    Object.assign(this, params);
  }
}
