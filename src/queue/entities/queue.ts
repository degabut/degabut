import { Track } from "./track";

interface ConstructorProps {
  guildId: string;
}

export enum LoopType {
  Disabled = "DISABLED",
  Song = "SONG",
  Queue = "QUEUE",
}

export class Queue {
  public readonly guildId: string;
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

  constructor(props: ConstructorProps) {
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
  }
}
