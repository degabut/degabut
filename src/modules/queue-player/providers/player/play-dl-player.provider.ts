// import {
//   AudioPlayerStatus,
//   AudioResource,
//   VoiceConnection,
//   VoiceConnectionStatus,
//   createAudioPlayer,
//   createAudioResource,
//   joinVoiceChannel,
// } from "@discordjs/voice";
// import { InternalServerErrorException } from "@nestjs/common";
// import { Client, Guild } from "discord.js";
// import { EventEmitter } from "events";
// import playDl from "play-dl";
// import TypedEventEmitter from "typed-emitter";

// import {
//   AudioPlayerEvents,
//   AudioPlayerManagerEvents,
//   IAudioPlayer,
//   IAudioPlayerManager,
//   TrackEndReason,
// } from "./audio-player-manager.interface";

// export class PlayDlPlayerProvider
//   extends (EventEmitter as new () => TypedEventEmitter<AudioPlayerManagerEvents>)
//   implements IAudioPlayerManager
// {
//   private client!: Client;

//   init(client: Client): IAudioPlayerManager {
//     this.client = client;
//     return this;
//   }

//   createAudioPlayer(guildId: string): IAudioPlayer {
//     const guild = this.client.guilds.cache.get(guildId);
//     if (!guild) throw new InternalServerErrorException("Guild not found");

//     return new AudioPlayer(guild);
//   }

//   // No implementation needed
//   connect(): void {}

//   get isReady(): boolean {
//     return true;
//   }
// }

// class AudioPlayer
//   extends (EventEmitter as new () => TypedEventEmitter<AudioPlayerEvents>)
//   implements IAudioPlayer
// {
//   private guild: Guild;
//   private isStopped = false;
//   private currentChannelId: string | null = null;
//   private player = createAudioPlayer();
//   private resource: AudioResource | null = null;
//   private connection: VoiceConnection | null = null;
//   private tickInterval: NodeJS.Timeout | null = null;

//   constructor(guild: Guild) {
//     super();
//     this.guild = guild;
//   }

//   get isSeekable() {
//     return false;
//   }

//   get isConnected() {
//     return this.connection?.state.status === VoiceConnectionStatus.Ready;
//   }

//   get isPaused() {
//     return this.player.state.status === AudioPlayerStatus.Paused;
//   }

//   get isPlaying() {
//     return this.player.state.status === AudioPlayerStatus.Playing;
//   }

//   get position() {
//     return this.resource?.playbackDuration;
//   }

//   connect(channelId: string): void {
//     const adapterCreator = this.guild.voiceAdapterCreator;
//     if (!adapterCreator) throw new InternalServerErrorException("Voice adapter creator not found");

//     this.currentChannelId = channelId;
//     this.connection = joinVoiceChannel({
//       channelId,
//       guildId: this.guild.id,
//       adapterCreator,
//       selfDeaf: true,
//     });

//     this.connection.subscribe(this.player);

//     this.connection.on(VoiceConnectionStatus.Ready, () => this.emit("ready"));
//     this.connection.on("stateChange", () => {
//       const newChannelId = this.connection?.joinConfig.channelId;

//       if (newChannelId && this.currentChannelId && newChannelId !== this.currentChannelId) {
//         this.emit("moved", this.currentChannelId, newChannelId);
//         this.currentChannelId = newChannelId;
//       }
//     });
//     this.connection.on(VoiceConnectionStatus.Disconnected, () => this.emit("disconnected"));

//     this.player.on("error", (e) => this.onError(e));
//     this.connection.on("error", (e) => this.onError(e));
//   }

//   disconnect(): void {
//     this.connection?.disconnect();
//   }

//   async play(videoId: string, seek = 0) {
//     const { stream, type } = await playDl.stream(videoId, { seek: seek / 1000 });

//     stream.once("close", () => {
//       this.onStreamEnd(this.isStopped ? TrackEndReason.STOPPED : TrackEndReason.FINISHED);
//     });

//     stream.once("error", (err) => {
//       this.onStreamEnd(TrackEndReason.ERROR);
//       this.emit("trackException", err);
//     });

//     this.resource = createAudioResource(stream, { inputType: type });
//     this.player.play(this.resource);
//     this.startTick();

//     if (!seek) this.emit("trackStart");

//     this.isStopped = false;
//   }

//   async seek(): Promise<void> {
//     // TODO implement
//   }

//   async resume(): Promise<void> {
//     this.player.unpause();
//     this.startTick();
//   }

//   async pause(): Promise<void> {
//     this.player.pause();
//     this.stopTick();
//   }

//   async stop(): Promise<void> {
//     this.isStopped = true;
//     this.player.stop(true);
//     this.stopTick();
//   }

//   private startTick(interval = 5000) {
//     if (this.tickInterval) return;
//     this.tickInterval = setInterval(() => this.emit("tick", this.position || null), interval);
//   }

//   private stopTick() {
//     if (this.tickInterval) {
//       clearInterval(this.tickInterval);
//       this.tickInterval = null;
//     }
//   }

//   private onError(err: Error) {
//     this.emit("error", err);
//   }

//   private onStreamEnd(reason: TrackEndReason) {
//     this.resource = null;
//     this.emit("trackEnd", reason);
//     this.stopTick();
//   }
// }
