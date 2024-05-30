import { Track } from "@queue/entities";
import { GuildMember } from "discord.js";

export class TrackSkippedEvent {
  public readonly track!: Track;
  public readonly member!: GuildMember;

  constructor(params: TrackSkippedEvent) {
    Object.assign(this, params);
  }
}
