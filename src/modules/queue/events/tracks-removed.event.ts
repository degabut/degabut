import { Member, Track } from "@queue/entities";

export class TracksRemovedEvent {
  public readonly tracks!: Track[];
  public readonly member?: Member;

  constructor(params: TracksRemovedEvent) {
    Object.assign(this, params);
  }
}
