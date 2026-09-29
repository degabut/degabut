import { Client } from "discord.js";
import TypedEmitter from "typed-emitter";

import { LavalinkFilter } from "./lavalink-player.provider";

export type AudioPlayerManagerEvents = {
  disconnected: () => void;
};

export interface IAudioPlayerManager extends TypedEmitter<AudioPlayerManagerEvents> {
  get isReady(): boolean;

  init(client: Client): IAudioPlayerManager;
  createAudioPlayer(guildId: string): IAudioPlayer;
}

export enum TrackEndReason {
  FINISHED = "FINISHED",
  ERROR = "ERROR",
  STOPPED = "STOPPED",
}

// TODO standard type for filters
export type PlayerFilters = LavalinkFilter;

export type PlayerStream = {
  stream: AsyncIterable<Uint8Array>;
  contentType: string;
  close(): Promise<void>;
};

export type AudioPlayerEvents = {
  tick: (position: number | null) => void;
  ready: () => void;
  moved: (from: string, to: string) => void;
  disconnected: () => void;
  trackStart: () => void;
  trackEnd: (reason: TrackEndReason) => void;
  trackException: (e: Error) => void;
  error: (e: Error) => void;
};

export interface IAudioPlayer extends TypedEmitter<AudioPlayerEvents> {
  get isSeekable(): boolean;
  get isConnected(): boolean;
  get isPaused(): boolean;
  get isPlaying(): boolean;
  get position(): number | undefined;
  get filters(): PlayerFilters;
  get plugins(): string[];
  get type(): string;

  connect(voiceChannelId: string): void;
  disconnect(): void;
  play(videoId: string): Promise<void>;
  openLiveStream(onClose?: () => void): Promise<PlayerStream>;
  seek(position: number): Promise<void>;
  resume(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  applyFilters(filter: PlayerFilters): Promise<void>;
}
