import { Member, Track } from "@queue/entities";

export class TrackMarkedPlayNextEvent {
  public readonly track!: Track;
  public readonly member!: Member;

  constructor(params: TrackMarkedPlayNextEvent) {
    Object.assign(this, params);
  }
}
