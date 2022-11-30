import { QueuePlayer } from "@discord-bot/entities";
import { GuildMember } from "discord.js";

export class TrackSeekedEvent {
  public readonly seek!: number;
  public readonly member!: GuildMember;
  public readonly player!: QueuePlayer;

  constructor(params: TrackSeekedEvent) {
    Object.assign(this, params);
  }
}
