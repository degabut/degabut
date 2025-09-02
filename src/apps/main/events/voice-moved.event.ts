import { BaseGuildVoiceChannel } from "discord.js";

export class VoiceMovedEvent {
  public readonly from!: BaseGuildVoiceChannel;
  public readonly to!: BaseGuildVoiceChannel;

  constructor(params: VoiceMovedEvent) {
    Object.assign(this, params);
  }
}
