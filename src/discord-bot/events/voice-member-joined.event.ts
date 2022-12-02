import { BaseGuildVoiceChannel, GuildMember } from "discord.js";

export class VoiceMemberJoinedEvent {
  public readonly voiceChannel!: BaseGuildVoiceChannel;
  public readonly member!: GuildMember;

  constructor(params: VoiceMemberJoinedEvent) {
    Object.assign(this, params);
  }
}
