import {
	AudioPlayer,
	AudioPlayerStatus,
	AudioResource,
	createAudioPlayer,
	entersState,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
} from "@discordjs/voice";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import { EventEmitter } from "events";
import { promisify } from "node:util";
import { Track } from ".";

const wait = promisify(setTimeout);

interface ConstructorProps {
	voiceConnection: VoiceConnection;
	voiceChannel: BaseGuildVoiceChannel;
	textChannel: BaseGuildTextChannel;
}

export enum LoopType {
	Disabled = "Disabled",
	Song = "Song",
	Queue = "Queue",
}

export class Queue extends EventEmitter {
	private readonly audioPlayer: AudioPlayer;
	public readonly voiceConnection: VoiceConnection;
	private textChannel: BaseGuildTextChannel;
	public voiceChannel: BaseGuildVoiceChannel;
	public nowPlaying: Track | null;
	public readonly tracks: Track[];
	public readonly history: Track[];
	public loopType: LoopType;
	private autoplay: boolean;
	public readyLock: boolean;

	constructor(props: ConstructorProps) {
		super();

		this.voiceConnection = props.voiceConnection;
		this.voiceChannel = props.voiceChannel;
		this.textChannel = props.textChannel;
		this.nowPlaying = null;
		this.tracks = [];
		this.history = [];
		this.loopType = LoopType.Disabled;
		this.autoplay = false;
		this.readyLock = false;

		this.audioPlayer = createAudioPlayer();

		this.voiceConnection.on("stateChange", async (_, newState) => {
			if (newState.status === VoiceConnectionStatus.Disconnected) {
				if (
					newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
					newState.closeCode === 4014
				) {
					try {
						await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
					} catch {
						this.voiceConnection.destroy();
					}
				} else if (this.voiceConnection.rejoinAttempts < 5) {
					await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
					this.voiceConnection.rejoin();
				} else {
					this.voiceConnection.destroy();
				}
			} else if (newState.status === VoiceConnectionStatus.Destroyed) {
				this.stop();
			} else if (
				!this.readyLock &&
				(newState.status === VoiceConnectionStatus.Connecting ||
					newState.status === VoiceConnectionStatus.Signalling)
			) {
				this.readyLock = true;
				try {
					await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
				} catch {
					if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed)
						this.voiceConnection.destroy();
				} finally {
					this.readyLock = false;
					this.processQueue();
				}
			}
		});

		// Configure audio player
		this.audioPlayer.on("stateChange", (oldState, newState) => {
			if (
				newState.status === AudioPlayerStatus.Idle &&
				oldState.status !== AudioPlayerStatus.Idle
			) {
				(oldState.resource as AudioResource<Track>).metadata.emit("finish");
			} else if (newState.status === AudioPlayerStatus.Playing) {
				(newState.resource as AudioResource<Track>).metadata.emit("start");
			}
		});

		this.audioPlayer.on("error", (error) => {
			(error.resource as AudioResource<Track>).metadata.emit("error", error);
		});

		props.voiceConnection.subscribe(this.audioPlayer);
	}

	public addTrack(track: Track): void {
		this.tracks.push(track);
		if (this.nowPlaying) {
			this.textChannel.send({
				content: `🎵 **Added To Queue** (${this.tracks.length})`,
				embeds: [track.embed],
			});
		} else {
			this.processQueue();
		}
	}

	public remove(index: number): Track | null {
		const [removed] = this.tracks.splice(index, 1);
		if (index === 0) this.skip();
		return removed;
	}

	public async skip(): Promise<void> {
		if (!this.nowPlaying) return;
		await this.textChannel.send(`⏭ **Skipping ${this.nowPlaying.title}**`);
		// this will triggers `finish` event on nowPlaying
		this.audioPlayer.stop(true);
	}

	public stop(): void {
		this.readyLock = true;
		this.audioPlayer.stop(true);
		this.voiceConnection.disconnect();
	}

	public toggleAutoplay(): boolean {
		this.autoplay = !this.autoplay;
		return this.autoplay;
	}

	private async processQueue(): Promise<void> {
		if (this.readyLock) return;

		this.nowPlaying = this.tracks[0];
		if (!this.nowPlaying) {
			if (!this.autoplay) return;

			// Autoplay
			const lastSong = this.history[0];
			if (!lastSong) return;
			this.emit("autoplay");
			return;
		}

		this.history.unshift(this.nowPlaying);
		this.history.splice(10);

		this.nowPlaying.removeAllListeners();
		this.nowPlaying.on("finish", () => {
			if (this.loopType === LoopType.Song) return this.play();

			const previous = this.tracks.shift();
			if (this.loopType === LoopType.Queue && previous) this.tracks.push(previous);

			this.nowPlaying = null;
			this.processQueue();
		});
		this.nowPlaying.on("start", () => {
			if (!this.nowPlaying) return;
			this.textChannel.send({
				content: "🎶 **Now Playing**",
				embeds: [this.nowPlaying.embed],
			});
		});
		this.nowPlaying.on("error", () => {
			/* TODO handle error */
		});

		this.play();
	}

	private async play(): Promise<void> {
		if (!this.nowPlaying) return;
		try {
			const resource = await this.nowPlaying.createAudioSource();
			this.audioPlayer.play(resource);
		} catch (error) {
			this.nowPlaying.emit("error", error);
			this.processQueue();
		}
	}
}
