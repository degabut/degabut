import { Member, Track } from "@queue/entities";

export class TrackSkippedEvent {
  public readonly track!: Track;
  public readonly member!: Member;

  constructor(params: TrackSkippedEvent) {
    Object.assign(this, params);
  }
}
