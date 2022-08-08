import { QueuePlayer } from "@discord-bot/entities";
import { GuildMember } from "discord.js";

export class VoiceMemberJoinedEvent {
  public readonly player!: QueuePlayer;
  public readonly member!: GuildMember;

  constructor(params: VoiceMemberJoinedEvent) {
    Object.assign(this, params);
  }
}
