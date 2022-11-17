import { Executor } from "@common/interfaces";
import { Track } from "@queue/entities";

export class TrackMarkedPlayNextEvent {
  public readonly track!: Track;
  public readonly executor!: Executor;

  constructor(params: TrackMarkedPlayNextEvent) {
    Object.assign(this, params);
  }
}
