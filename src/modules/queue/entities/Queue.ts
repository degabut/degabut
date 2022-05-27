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

	public changeTrackOrder(from: number | string, toIndex: number): void {
		const fromIndex =
			typeof from === "number" ? from : this.tracks.findIndex((track) => track.id === from);

		if (fromIndex === 0) throw new Error("Can't move currently playing track");

		const track = this.tracks[fromIndex];
		if (!track) return; // TODO handle error

		this.tracks.splice(fromIndex, 1);
		this.tracks.splice(toIndex, 0, track);
	}

	public remove(indexOrId: number | string): Track | null {
		const index =
			typeof indexOrId === "number"
				? indexOrId
				: this.tracks.findIndex((track) => track.id === indexOrId);

		let removed: Track | null;
		if (index === 0) {
			removed = this.nowPlaying;
			this.audioPlayer.stop();
		} else {
			removed = this.tracks.splice(index, 1)[0];
		}

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
		if (this.readyLock || this.nowPlaying) return;

		this.nowPlaying = this.tracks[0];
		if (!this.nowPlaying) return;

		this.history.unshift(this.nowPlaying);
		this.history.splice(10);

		this.nowPlaying.removeAllListeners();
		this.nowPlaying.once("finish", () => {
			if (this.loopType === LoopType.Song) return this.play();

			const previous = this.tracks.shift();
			if (this.loopType === LoopType.Queue && previous) this.tracks.push(previous);

			this.nowPlaying = null;
			this.emit("trackEnd");
			this.processQueue();
		});
		this.nowPlaying.once("start", () => {
			if (!this.nowPlaying) return;
			this.emit("trackStart");
		});
		this.nowPlaying.on("error", () => {
			this.nowPlaying = null;
			this.processQueue();
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
