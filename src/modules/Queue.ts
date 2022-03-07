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
import { GuildMember, TextChannel } from "discord.js";
import { promisify } from "node:util";
import { LiveVideo, Video, VideoCompact } from "youtubei";
import { Track } from ".";
import { youtube } from "../shared";

const wait = promisify(setTimeout);

type AddProps = {
	id?: string;
	keyword?: string;
	textChannel?: TextChannel;
	author: GuildMember;
};

interface ConstructorProps {
	voiceConnection: VoiceConnection;
	textChannel: TextChannel;
}

export class Queue {
	private readonly audioPlayer: AudioPlayer;
	public readonly voiceConnection!: VoiceConnection;
	private textChannel!: TextChannel;
	public nowPlaying: Track | null = null;
	private tracks: Track[] = [];
	private loopSong = false;
	private loopQueue = false;
	public readyLock = false;

	constructor(props: ConstructorProps) {
		Object.assign(this, props);
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
				this.processQueue();
			} else if (newState.status === AudioPlayerStatus.Playing) {
				(newState.resource as AudioResource<Track>).metadata.emit("start");
			}
		});

		this.audioPlayer.on("error", (error) => {
			(error.resource as AudioResource<Track>).metadata.emit("error", error);
		});

		props.voiceConnection.subscribe(this.audioPlayer);
	}

	async add({ id, keyword, author, textChannel }: AddProps): Promise<Track | undefined> {
		if (!id && !keyword) throw new Error("No search term provided");

		let video: Video | LiveVideo | VideoCompact | undefined;

		if (id) video = await youtube.getVideo(id);
		else if (keyword) video = (await youtube.search(keyword, { type: "video" })).shift();
		if (!video) return;

		const track = new Track({
			id: video.id,
			thumbnailUrl: video.thumbnails.best || "",
			title: video.title,
			requestedBy: author,
			duration: ("duration" in video ? video.duration : 0) || 0,
		});

		if (textChannel) this.textChannel = textChannel;
		this.addTrack(track);
	}

	private addTrack(track: Track): void {
		this.tracks.push(track);
		this.processQueue();
	}

	remove(index: number): void {
		this.tracks.splice(index, 1);
	}

	skip(): void {
		if (!this.nowPlaying) return;
		// this will triggers `finish` event on nowPlaying
		this.audioPlayer.stop(true);
	}

	stop(): void {
		this.tracks = [];
		this.audioPlayer.stop(true);
		this.voiceConnection.disconnect();
	}

	toggleLoopSong(): boolean {
		this.loopSong = !this.loopSong;
		return this.loopSong;
	}

	toggleLoopQueue(): boolean {
		this.loopQueue = !this.loopQueue;
		return this.loopQueue;
	}

	private processQueue(): void {
		if (this.nowPlaying) return;

		const nextTrack = this.tracks[0];
		if (!nextTrack) return;
		console.log("Next Track", nextTrack.title);

		this.nowPlaying = nextTrack;

		nextTrack.on("finish", () => {
			this.textChannel.send("Finished Playing: " + nextTrack.title);
			this.nowPlaying = null;
			this.processQueue();
		});

		nextTrack.on("start", () => {
			this.textChannel.send("Start Playing: " + nextTrack.title);
		});

		if (!this.loopSong) this.tracks.shift();
		if (this.loopQueue) {
			this.tracks.shift();
			if (this.nowPlaying) this.tracks.push(this.nowPlaying);
		}

		try {
			const resource = nextTrack.createAudioSource();
			this.audioPlayer.play(resource);
		} catch (error) {
			console.log("error!");
			nextTrack.emit("error", error);
			this.processQueue();
		}
	}
}
