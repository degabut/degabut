import { QueuePlayer } from "@discord-bot/entities";
import { GuildMember } from "discord.js";

export class VoiceMemberLeftEvent {
  public readonly player!: QueuePlayer;
  public readonly member!: GuildMember;

  constructor(params: VoiceMemberLeftEvent) {
    Object.assign(this, params);
  }
}
