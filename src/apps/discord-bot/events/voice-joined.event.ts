import { BaseGuildVoiceChannel } from "discord.js";

export class VoiceJoinedEvent {
  public readonly voiceChannel!: BaseGuildVoiceChannel;

  constructor(params: VoiceJoinedEvent) {
    Object.assign(this, params);
  }
}
