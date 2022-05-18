import { AudioPlayer, createAudioPlayer, VoiceConnection } from "@discordjs/voice";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import { EventEmitter } from "events";
import { Track } from "./Track";

interface ConstructorProps {
	voiceConnection: VoiceConnection;
	voiceChannel: BaseGuildVoiceChannel;
	textChannel: BaseGuildTextChannel;
}

export enum LoopType {
	Disabled = "DISABLED",
	Song = "SONG",
	Queue = "QUEUE",
}

export class Queue extends EventEmitter {
	public readonly audioPlayer: AudioPlayer;
	public readonly voiceConnection: VoiceConnection;
	public readonly tracks: Track[];
	public readonly history: Track[];
	public textChannel: BaseGuildTextChannel;
	public voiceChannel: BaseGuildVoiceChannel;
	public nowPlaying: Track | null;
	public loopType: LoopType;
	public autoplay: boolean;
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
	}

	public addTrack(track: Track): void {
		this.tracks.push(track);
		if (!this.nowPlaying) this.processQueue();
	}

	public changeTrackOrder(fromIndex: number, toIndex: number): void {
		const track = this.tracks[fromIndex];
		if (!track) return; // TODO handle error
		this.tracks.splice(fromIndex, 1);
		this.tracks.splice(toIndex, 0, track);
	}

	public remove(index: number): Track | null {
		const [removed] = this.tracks.splice(index, 1);
		if (index === 0) this.audioPlayer.stop();
		return removed;
	}

	public skip(): Track | undefined {
		if (!this.nowPlaying) return;
		const skipped = this.nowPlaying;
		// this will triggers `finish` event on nowPlaying
		this.audioPlayer.stop(true);
		return skipped;
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

	public async processQueue(): Promise<void> {
		if (this.readyLock) return;

		this.nowPlaying = this.tracks[0];
		if (!this.nowPlaying) return;

		this.history.unshift(this.nowPlaying);
		this.history.splice(10);

		this.nowPlaying.removeAllListeners();
		this.nowPlaying.on("finish", () => {
			if (this.loopType === LoopType.Song) return this.play();

			const previous = this.tracks.shift();
			if (this.loopType === LoopType.Queue && previous) this.tracks.push(previous);

			this.nowPlaying = null;
			this.emit("trackEnd");
			this.processQueue();
		});
		this.nowPlaying.on("start", () => {
			if (!this.nowPlaying) return;
			this.emit("trackStart");
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
