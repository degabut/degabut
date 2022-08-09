import { Track } from "./track";
import { VoiceChannel } from "./voice-channel";

interface ConstructorProps {
  guildId: string;
  voiceChannel: VoiceChannel;
}

export enum LoopType {
  Disabled = "DISABLED",
  Song = "SONG",
  Queue = "QUEUE",
}

export class Queue {
  public readonly guildId: string;
  public voiceChannelId: string;
  public tracks: Track[];
  public history: Track[];
  public nowPlaying: Track | null;
  public nextTrack: Track | null;
  public loopType: LoopType;
  public autoplay: boolean;
  public isPaused: boolean;
  public shuffle: boolean;
  public shuffleHistoryIds: string[];
  public previousShuffleHistoryIds: string[];
  public voiceChannel: VoiceChannel;

  constructor(props: ConstructorProps) {
    this.voiceChannelId = props.voiceChannel.id;
    this.guildId = props.guildId;
    this.nextTrack = null;
    this.nowPlaying = null;
    this.tracks = [];
    this.history = [];
    this.loopType = LoopType.Disabled;
    this.autoplay = false;
    this.shuffle = false;
    this.isPaused = false;
    this.shuffleHistoryIds = [];
    this.previousShuffleHistoryIds = [];
    this.voiceChannel = props.voiceChannel;
  }

  public hasMember(userId: string): boolean {
    return this.voiceChannel.members.some((m) => m.id === userId);
  }
}
