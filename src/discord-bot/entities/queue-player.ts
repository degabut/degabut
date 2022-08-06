import { AudioPlayer, createAudioPlayer, VoiceConnection } from "@discordjs/voice";
import { BaseGuild, BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";

interface ConstructorProps {
  voiceConnection: VoiceConnection;
  voiceChannel: BaseGuildVoiceChannel;
  textChannel: BaseGuildTextChannel;
}

export class QueuePlayer {
  public readonly guild: BaseGuild;
  public readonly audioPlayer: AudioPlayer;
  public readonly voiceConnection: VoiceConnection;
  public textChannel: BaseGuildTextChannel;
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
}
