import { QueuePlayer } from "@queue-player/entities";
import { GuildMember } from "discord.js";

export class PlayerFiltersChangedEvent {
  public readonly player!: QueuePlayer;
  public readonly member!: GuildMember;

  constructor(params: PlayerFiltersChangedEvent) {
    Object.assign(this, params);
  }
}
