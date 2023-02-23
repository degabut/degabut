import {
  BaseGuild,
  BaseGuildTextChannel,
  BaseGuildVoiceChannel,
  DiscordAPIError,
  GuildMember,
  Message,
  MessageOptions,
  MessagePayload,
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
  private keyedMessage: Record<string, Message>;

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

  async notify(
    message: string | MessagePayload | MessageOptions,
    key?: NotifyKey,
  ): Promise<Message | undefined> {
    let sentMessage: Message | undefined = undefined;
    if (this.textChannel) {
      try {
        sentMessage = await this.textChannel.send(message);
      } catch (err) {
        if (!(err instanceof DiscordAPIError)) return;
        if (err.code === 10003) this.textChannel = null;
      }
    }

    if (!sentMessage) {
      if (!this.voiceChannel.isTextBased()) return;
      try {
        sentMessage = await this.voiceChannel.send(message);
      } catch {
        // ignore
      }
    }

    if (sentMessage && key) {
      const lastMessage = this.keyedMessage[key];
      if (lastMessage) await lastMessage.delete();
      this.keyedMessage[key] = sentMessage;
    }

    return sentMessage;
  }
}
