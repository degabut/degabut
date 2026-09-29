import { IAudioPlayer } from "@queue-player/providers/player";
import { Member, Queue, Track } from "@queue/entities";
import { randomBytes } from "crypto";
import { BaseGuild, BaseGuildTextChannel, BaseGuildVoiceChannel, Message } from "discord.js";

export type NotifyKey = "NOW_PLAYING";

export const MAX_STREAMS_PER_USER = 3;

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
  private readonly streamTokens = new Map<string, string>();
  private readonly activeStreams = new Map<string, number>();

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

  public issueStreamToken(userId: string): string {
    const existing = this.streamTokens.get(userId);
    if (existing) return existing;

    const token = randomBytes(32).toString("base64url");
    this.streamTokens.set(userId, token);
    return token;
  }

  public resolveStreamToken(token: string): string | null {
    for (const [userId, value] of this.streamTokens) {
      if (value === token) return userId;
    }
    return null;
  }

  public acquireStreamSlot(userId: string): (() => void) | false {
    const current = this.activeStreams.get(userId) ?? 0;

    if (current >= MAX_STREAMS_PER_USER) return false;

    this.activeStreams.set(userId, current + 1);

    let released = false;
    return () => {
      if (released) return;
      released = true;

      const remaining = (this.activeStreams.get(userId) ?? 1) - 1;
      if (remaining <= 0) this.activeStreams.delete(userId);
      else this.activeStreams.set(userId, remaining);
    };
  }

  public destroy() {
    this.isDestroyed = true;
    this.audioPlayer.disconnect();
  }
}
