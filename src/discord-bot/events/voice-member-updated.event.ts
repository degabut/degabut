import { QueuePlayer } from "@discord-bot/entities";
import { GuildMember } from "discord.js";

export class VoiceMemberUpdatedEvent {
  public readonly player!: QueuePlayer;
  public readonly member!: GuildMember;

  constructor(params: VoiceMemberUpdatedEvent) {
    Object.assign(this, params);
  }
}
