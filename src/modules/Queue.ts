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
	public tracks: Track[] = [];
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

	async add({ id, keyword, author, textChannel }: AddProps): Promise<Track> {
		if (!id && !keyword) throw new Error("No search term provided");

		let video: Video | LiveVideo | VideoCompact | undefined;

		if (id) video = await youtube.getVideo(id);
		else if (keyword) video = (await youtube.search(keyword, { type: "video" })).shift();
		if (!video) throw new Error("Video Not Found");

		const track = new Track({
			id: video.id,
			thumbnailUrl: video.thumbnails.best || "",
			title: video.title,
			requestedBy: author,
			channel: video.channel,
			duration: ("duration" in video ? video.duration : 0) || 0,
		});

		if (textChannel) this.textChannel = textChannel;
		this.addTrack(track);
		return track;
	}

	private addTrack(track: Track): void {
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

	remove(index: number): Track | null {
		if (index === 0) {
			const removed = this.nowPlaying;
			this.skip();
			return removed;
		} else {
			const [removed] = this.tracks.splice(index, 1);
			return removed;
		}
	}

	async skip(): Promise<void> {
		if (!this.nowPlaying) return;
		await this.textChannel.send(`⏭ **Skipping ${this.nowPlaying.title}**`);
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

	private async processQueue(): Promise<void> {
		this.nowPlaying = this.tracks[0];
		if (!this.nowPlaying) return;

		this.nowPlaying.removeAllListeners();
		this.nowPlaying.on("finish", () => {
			if (this.loopSong) return this.play();

			const previous = this.tracks.shift();
			if (this.loopQueue && previous) this.tracks.push(previous);

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
