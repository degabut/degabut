import { Executor } from "@common/interfaces";
import { Track } from "@queue/entities";

export class TrackSkippedEvent {
  public readonly track!: Track;
  public readonly executor!: Executor;

  constructor(params: TrackSkippedEvent) {
    Object.assign(this, params);
  }
}
