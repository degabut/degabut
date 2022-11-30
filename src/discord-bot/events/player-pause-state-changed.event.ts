import { QueuePlayer } from "@discord-bot/entities";
import { GuildMember } from "discord.js";

export class PlayerPauseStateChangedEvent {
  public readonly player!: QueuePlayer;
  public readonly member!: GuildMember;

  constructor(params: PlayerPauseStateChangedEvent) {
    Object.assign(this, params);
  }
}
