import { BaseGuildVoiceChannel } from "discord.js";

export class VoiceLeftEvent {
  public readonly voiceChannel!: BaseGuildVoiceChannel;

  constructor(params: VoiceLeftEvent) {
    Object.assign(this, params);
  }
}
