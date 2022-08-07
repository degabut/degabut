import { Track } from "@queue/entities";
import { GuildMember } from "discord.js";

export class TrackAudioSkippedEvent {
  public readonly track!: Track;
  public readonly skippedBy!: GuildMember;

  constructor(params: TrackAudioSkippedEvent) {
    Object.assign(this, params);
  }
}
