import { Member, Track } from "@queue/entities";

export class TrackAddedEvent {
  public readonly track!: Track;
  public readonly member!: Member;
  public readonly isPlayedImmediately!: boolean;

  constructor(params: TrackAddedEvent) {
    Object.assign(this, params);
  }
}
