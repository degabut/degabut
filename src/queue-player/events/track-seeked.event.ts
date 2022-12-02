import { QueuePlayer } from "@queue-player/entities";
import { GuildMember } from "discord.js";

export class TrackSeekedEvent {
  public readonly position!: number;
  public readonly member!: GuildMember;
  public readonly player!: QueuePlayer;

  constructor(params: TrackSeekedEvent) {
    Object.assign(this, params);
  }
}
