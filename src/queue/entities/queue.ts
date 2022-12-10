import { Guild } from "./guild";
import { Member } from "./member";
import { Track } from "./track";
import { VoiceChannel } from "./voice-channel";

interface ConstructorProps {
  voiceChannel: VoiceChannel;
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
  }

  public getMember(userId: string): Member | undefined {
    return this.voiceChannel.members.find((m) => m.id === userId);
  }
}
