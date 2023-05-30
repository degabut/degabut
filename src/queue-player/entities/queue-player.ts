import {
  BaseGuild,
  BaseGuildTextChannel,
  BaseGuildVoiceChannel,
  GuildMember,
  Message,
} from "discord.js";
import { Node, Player } from "lavaclient";

import { LavaTrack } from "./lava-track";

export type NotifyKey = "NOW_PLAYING";

interface ConstructorProps {
  audioPlayer: Player<Node>;
  voiceChannel: BaseGuildVoiceChannel;
  textChannel?: BaseGuildTextChannel | null;
}

export class QueuePlayer {
  public readonly guild: BaseGuild;
  public readonly audioPlayer: Player<Node>;
  public textChannel: BaseGuildTextChannel | null;
  public voiceChannel: BaseGuildVoiceChannel;
  public currentTrack: LavaTrack | null;
  public disconnectTimeout: NodeJS.Timeout | null;
  public keyedMessage: Record<string, Message>;

  constructor(props: ConstructorProps) {
    this.guild = props.voiceChannel.guild;
    this.voiceChannel = props.voiceChannel;
    this.textChannel = props.textChannel || null;
    this.audioPlayer = props.audioPlayer;
    this.currentTrack = null;
    this.disconnectTimeout = null;
    this.keyedMessage = {};
  }

  public getMember(userId: string): GuildMember | undefined {
    return this.voiceChannel.members.find((m) => m.id === userId);
  }
}
