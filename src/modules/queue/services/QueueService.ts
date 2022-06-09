import { BadRequestError } from "@core";
import {
	AudioPlayerStatus,
	AudioResource,
	entersState,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
} from "@discordjs/voice";
import { DiscordClient } from "@modules/discord/DiscordClient";
import { LoopType, Queue } from "@modules/queue/entities/Queue";
import { Track } from "@modules/queue/entities/Track";
import { ArrayUtils, RandomUtils } from "@utils";
import { BaseGuildTextChannel, BaseGuildVoiceChannel, ClientUser } from "discord.js";
import { inject, injectable } from "tsyringe";
import { QueueRepository } from "../repositories/QueueRepository";
import { TrackService } from "./TrackService";

type CreateQueueParams = {
	guildId: string;
	voiceChannel: BaseGuildVoiceChannel;
	textChannel: BaseGuildTextChannel;
};

@injectable()
export class QueueService {
	constructor(
		@inject(QueueRepository) private queueRepository: QueueRepository,
		@inject(DiscordClient) private client: DiscordClient,
		@inject(TrackService) private trackService: TrackService
	) {}

	public async createQueue({
		guildId,
		voiceChannel,
		textChannel,
	}: CreateQueueParams): Promise<Queue> {
		const guild = await this.client.guilds.fetch(guildId);
		const botGuildMember = await guild.members.fetch((this.client.user as ClientUser).id);

		const canJoin =
			botGuildMember.permissionsIn(voiceChannel.id).has("CONNECT") &&
			(!voiceChannel.userLimit || voiceChannel.members.size < voiceChannel.userLimit);

		if (!canJoin) throw new BadRequestError("Bot does not have permission to join voice channel");

		const queue = this.queueRepository.create({ guildId, voiceChannel, textChannel });
		this.initQueueConnection(queue);
		return queue;
	}

	public addQueueTrack(queue: Queue, track: Track): void {
		if (queue.tracks.length >= 250) throw new BadRequestError("Queue is full");
		queue.tracks.push(track);
		if (!queue.nowPlaying) this.processQueue(queue);
	}

	public changeQueueTrackOrder(queue: Queue, from: number | string, toIndex: number): void {
		const fromIndex =
			typeof from === "number" ? from : queue.tracks.findIndex((track) => track.id === from);

		const track = queue.tracks.at(fromIndex);
		if (!track) return; // TODO handle error

		queue.tracks.splice(fromIndex, 1);
		queue.tracks.splice(toIndex, 0, track);
	}

	public removeTrack(queue: Queue, opts: number | string | boolean): Track | null {
		let index: number;
		if (typeof opts === "number") index = opts;
		else if (typeof opts === "string") index = queue.tracks.findIndex((track) => track.id === opts);
		else if (opts) index = queue.tracks.findIndex((track) => track.id === queue.nowPlaying?.id);
		else throw new BadRequestError("Invalid remove track options");

		const toBeRemoved = queue.tracks[index];
		if (!toBeRemoved) return null;

		if (toBeRemoved.id === queue.nowPlaying?.id && !queue.shuffle) {
			queue.nextTrack = queue.tracks[index + 1] || null;
		}

		queue.tracks.splice(index, 1);
		if (toBeRemoved.id === queue.nowPlaying?.id) queue.audioPlayer.stop(true);

		return toBeRemoved;
	}

	public skipTrack(queue: Queue): Track | null {
		const track = queue.nowPlaying;
		if (!track) return null;
		queue.audioPlayer.stop(true);
		return track;
	}

	public stopQueue(queue: Queue): void {
		queue.readyLock = true;
		queue.audioPlayer.stop(true);
		if (queue.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
			queue.voiceConnection.destroy();
		}
		this.queueRepository.delete(queue.textChannel.guild.id);
	}

	private processQueue(queue: Queue): void {
		if (queue.readyLock) return;

		const nowPlayingIndex = queue.tracks.findIndex((t) => t.id === queue.nowPlaying?.id);
		queue.nowPlaying = null;
		if (queue.loopType === LoopType.Disabled && nowPlayingIndex >= 0) {
			queue.tracks.splice(nowPlayingIndex, 1);
		}

		let nextIndex = 0;

		if (queue.nextTrack) {
			const index = queue.tracks.findIndex((t) => t.id === queue.nextTrack?.id);
			nextIndex = Math.max(index, 0);
			queue.nextTrack = null;
		} else {
			switch (queue.loopType) {
				case LoopType.Song:
					nextIndex = Math.max(nowPlayingIndex, 0);
					break;
				case LoopType.Queue:
					nextIndex = queue.shuffle ? this.getShuffledTrackIndex(queue) : nowPlayingIndex + 1;
					break;
				default:
					nextIndex = queue.shuffle
						? RandomUtils.randomInt(0, queue.tracks.length - 1)
						: nowPlayingIndex;
					break;
			}
		}

		queue.nowPlaying = queue.tracks.at(nextIndex) || queue.tracks.at(0) || null;
		if (!queue.nowPlaying) return;

		queue.nowPlaying.removeAllListeners();
		queue.nowPlaying.on("finish", () => {
			queue.emit("trackEnd");
			if (queue.shuffle && queue.nowPlaying) queue.shuffleHistoryIds.push(queue.nowPlaying.id);
			this.processQueue(queue);
		});
		queue.nowPlaying.on("start", () => {
			if (!queue.nowPlaying) return;
			queue.nowPlaying.playedAt = new Date();
			queue.history.unshift(queue.nowPlaying);
			queue.history.splice(25);
			queue.emit("trackStart");
		});
		queue.nowPlaying.on("error", () => this.processQueue(queue));

		this.playQueue(queue);
	}

	private playQueue(queue: Queue): void {
		if (!queue.nowPlaying) return;
		try {
			const resource = this.trackService.createAudioSource(queue.nowPlaying);
			queue.audioPlayer.play(resource);
		} catch (error) {
			queue.nowPlaying.emit("error", error);
			this.processQueue(queue);
		}
	}

	private getShuffledTrackIndex(queue: Queue): number {
		let unplayedTracks = queue.tracks.filter((t) => !queue.shuffleHistoryIds.includes(t.id));
		if (!unplayedTracks.length) {
			unplayedTracks = queue.tracks;
			queue.previousShuffleHistoryIds = [...queue.shuffleHistoryIds];
			const lastShuffle = queue.shuffleHistoryIds.pop();
			queue.shuffleHistoryIds = [];
			if (lastShuffle) unplayedTracks = unplayedTracks.filter((t) => t.id !== lastShuffle);
		}

		if (!unplayedTracks.length) return 0;

		let randomTrack: Track | undefined;

		if (!queue.previousShuffleHistoryIds.length) {
			randomTrack = unplayedTracks.at(RandomUtils.randomInt(0, unplayedTracks.length - 1));
		} else {
			const randomTracks = unplayedTracks.sort((a, b) => {
				return (
					queue.previousShuffleHistoryIds.findIndex((id) => id === a.id) -
					queue.previousShuffleHistoryIds.findIndex((id) => id === b.id)
				);
			});
			randomTrack = ArrayUtils.pickRankedRandom(randomTracks);
		}

		return randomTrack ? queue.tracks.findIndex((t) => t.id === randomTrack?.id) : 0;
	}

	private initQueueConnection(queue: Queue): void {
		queue.voiceConnection.on<"stateChange">("stateChange", async (_, newState) => {
			if (newState.status === VoiceConnectionStatus.Disconnected) {
				if (
					newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
					newState.closeCode === 4014
				) {
					try {
						await entersState(queue.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
					} catch {
						this.stopQueue(queue);
					}
				} else if (queue.voiceConnection.rejoinAttempts < 5) {
					await new Promise((r) =>
						setTimeout(r, (queue.voiceConnection.rejoinAttempts + 1) * 5_000)
					);
					queue.voiceConnection.rejoin();
				} else {
					this.stopQueue(queue);
				}
			} else if (newState.status === VoiceConnectionStatus.Destroyed) {
				this.stopQueue(queue);
			} else if (
				!queue.readyLock &&
				(newState.status === VoiceConnectionStatus.Connecting ||
					newState.status === VoiceConnectionStatus.Signalling)
			) {
				queue.readyLock = true;
				try {
					await entersState(queue.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
				} catch {
					if (queue.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed)
						this.stopQueue(queue);
				} finally {
					queue.readyLock = false;
					this.processQueue(queue);
				}
			} else if (newState.status === VoiceConnectionStatus.Ready) {
				const voiceChannel =
					this.client.user &&
					queue.voiceChannel.guild.members.resolve(this.client.user.id)?.voice.channel;
				if (voiceChannel) queue.voiceChannel = voiceChannel;
			}
		});

		queue.audioPlayer.on<"stateChange">("stateChange", (oldState, newState) => {
			if (
				newState.status === AudioPlayerStatus.Idle &&
				oldState.status !== AudioPlayerStatus.Idle
			) {
				(oldState.resource as AudioResource<Track>).metadata.emit("finish");
			} else if (newState.status === AudioPlayerStatus.Playing) {
				(newState.resource as AudioResource<Track>).metadata.emit("start");
			}
		});

		queue.audioPlayer.on("error", (error) => {
			(error.resource as AudioResource<Track>).metadata.emit("error", error);
		});
		//#endregion

		queue.voiceConnection.subscribe(queue.audioPlayer);
	}
}
