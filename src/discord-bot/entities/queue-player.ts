import { AudioPlayer, createAudioPlayer, VoiceConnection } from "@discordjs/voice";
import {
  BaseGuild,
  BaseGuildTextChannel,
  BaseGuildVoiceChannel,
  DiscordAPIError,
  MessageOptions,
  MessagePayload,
} from "discord.js";

interface ConstructorProps {
  voiceConnection: VoiceConnection;
  voiceChannel: BaseGuildVoiceChannel;
  textChannel: BaseGuildTextChannel;
}

export class QueuePlayer {
  public readonly guild: BaseGuild;
  public readonly audioPlayer: AudioPlayer;
  public readonly voiceConnection: VoiceConnection;
  private textChannel: BaseGuildTextChannel | null;
  public voiceChannel: BaseGuildVoiceChannel;
  public readyLock: boolean;

  constructor(props: ConstructorProps) {
    this.guild = props.voiceChannel.guild;
    this.voiceConnection = props.voiceConnection;
    this.voiceChannel = props.voiceChannel;
    this.textChannel = props.textChannel;
    this.audioPlayer = createAudioPlayer();
    this.readyLock = true;
  }

  public hasMember(userId: string): boolean {
    return this.voiceChannel.members.some((m) => m.id === userId);
  }

  async notify(message: string | MessagePayload | MessageOptions) {
    if (this.textChannel) {
      try {
        await this.textChannel.send(message);
      } catch (err) {
        if (!(err instanceof DiscordAPIError)) return;
        if (err.code === 10003) this.textChannel = null;
        if (this.voiceChannel.isTextBased()) {
          await this.voiceChannel.send(message);
        }
      }
    } else {
      try {
        if (this.voiceChannel.isTextBased()) {
          await this.voiceChannel.send(message);
        }
      } catch {
        // ignore
      }
    }
  }
}
