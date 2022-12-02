import {
  BaseGuild,
  BaseGuildTextChannel,
  BaseGuildVoiceChannel,
  DiscordAPIError,
  GuildMember,
  MessageOptions,
  MessagePayload,
} from "discord.js";
import { Node, Player } from "lavaclient";

import { LavaTrack } from "./lava-track";

interface ConstructorProps {
  audioPlayer: Player<Node>;
  voiceChannel: BaseGuildVoiceChannel;
  textChannel?: BaseGuildTextChannel | null;
}

export class QueuePlayer {
  public readonly guild: BaseGuild;
  public readonly audioPlayer: Player<Node>;
  private textChannel: BaseGuildTextChannel | null;
  public voiceChannel: BaseGuildVoiceChannel;
  public currentTrack: LavaTrack | null;
  public disconnectTimeout: NodeJS.Timeout | null;

  constructor(props: ConstructorProps) {
    this.guild = props.voiceChannel.guild;
    this.voiceChannel = props.voiceChannel;
    this.textChannel = props.textChannel || null;
    this.audioPlayer = props.audioPlayer;
    this.currentTrack = null;
    this.disconnectTimeout = null;
  }

  public getMember(userId: string): GuildMember | undefined {
    return this.voiceChannel.members.find((m) => m.id === userId);
  }

  async notify(message: string | MessagePayload | MessageOptions) {
    if (this.textChannel) {
      try {
        await this.textChannel.send(message);
        return;
      } catch (err) {
        if (!(err instanceof DiscordAPIError)) return;
        if (err.code === 10003) this.textChannel = null;
      }
    }

    if (!this.voiceChannel.isTextBased()) return;
    try {
      await this.voiceChannel.send(message);
    } catch {
      // ignore
    }
  }
}
