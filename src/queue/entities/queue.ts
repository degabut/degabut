import { Guild } from "./guild";
import { Member } from "./member";
import { TextChannel } from "./text-channel";
import { Track } from "./track";
import { VoiceChannel } from "./voice-channel";

interface ConstructorProps {
  voiceChannel: VoiceChannel;
  textChannel?: TextChannel | null;
  guild: Guild;
}

export enum LoopMode {
  Disabled = "DISABLED",
  Track = "TRACK",
  Queue = "QUEUE",
}

export class Queue {
  public voiceChannelId: string;
  public tracks: Track[];
  public history: Track[];
  public nowPlaying: Track | null;
  public nextTrack: Track | null;
  public loopMode: LoopMode;
  public shuffle: boolean;
  public shuffleHistoryIds: string[];
  public previousShuffleHistoryIds: string[];
  public guild: Guild;
  public voiceChannel: VoiceChannel;
  public textChannel: TextChannel | null;

  constructor(props: ConstructorProps) {
    this.voiceChannelId = props.voiceChannel.id;
    this.nextTrack = null;
    this.nowPlaying = null;
    this.tracks = [];
    this.history = [];
    this.loopMode = LoopMode.Disabled;
    this.shuffle = false;
    this.shuffleHistoryIds = [];
    this.previousShuffleHistoryIds = [];
    this.guild = props.guild;
    this.voiceChannel = props.voiceChannel;
    this.textChannel = props.textChannel || null;
  }

  public getMember(userId: string, isActive = true): Member | undefined {
    return this.voiceChannel.members.find(
      (m) => m.id === userId && m.isInVoiceChannel === isActive,
    );
  }
}
