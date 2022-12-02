import { BaseGuildVoiceChannel, GuildMember } from "discord.js";

export class VoiceMemberUpdatedEvent {
  public readonly voiceChannel!: BaseGuildVoiceChannel;
  public readonly member!: GuildMember;

  constructor(params: VoiceMemberUpdatedEvent) {
    Object.assign(this, params);
  }
}
