import { Member, Track } from "@queue/entities";

export class NextTrackAddedEvent {
  public readonly track!: Track;
  public readonly member!: Member;
  public readonly playNow!: boolean;

  constructor(params: NextTrackAddedEvent) {
    Object.assign(this, params);
  }
}
