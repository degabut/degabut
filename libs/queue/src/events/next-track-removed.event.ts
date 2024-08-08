import { Member, Track } from "@queue/entities";

export class NextTrackRemovedEvent {
  public readonly track!: Track;
  public readonly member?: Member;

  constructor(params: NextTrackRemovedEvent) {
    Object.assign(this, params);
  }
}
