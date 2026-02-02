import { IAudioPlayer } from "@queue-player/providers/player";
import { Member, Queue, Track } from "@queue/entities";
import { BaseGuild, BaseGuildTextChannel, BaseGuildVoiceChannel, Message } from "discord.js";

export type NotifyKey = "NOW_PLAYING";

interface ConstructorProps {
  audioPlayer: IAudioPlayer;
  voiceChannel: BaseGuildVoiceChannel;
  textChannel?: BaseGuildTextChannel | null;
}

export class QueuePlayer {
  public readonly guild: BaseGuild;
  public readonly audioPlayer: IAudioPlayer;
  public queue!: Queue;
  public isDestroyed = false;
  public textChannel: BaseGuildTextChannel | null;
  public voiceChannel: BaseGuildVoiceChannel;
  public currentTrack: Track | null;
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

  public getMember(userId: string): Member | undefined {
    return this.queue.voiceChannel.activeMembers.find((m) => m.id === userId);
  }

  public destroy() {
    this.isDestroyed = true;
    this.audioPlayer.disconnect();
  }
}
