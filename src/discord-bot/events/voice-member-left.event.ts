import { BaseGuildVoiceChannel, GuildMember } from "discord.js";

export class VoiceMemberLeftEvent {
  public readonly voiceChannel!: BaseGuildVoiceChannel;
  public readonly member!: GuildMember;

  constructor(params: VoiceMemberLeftEvent) {
    Object.assign(this, params);
  }
}
