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
import { randomInt } from "@utils";
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

		const removed = queue.tracks.at(index);
		if (!removed) return null;

		if (removed.id === queue.nowPlaying?.id) queue.audioPlayer.stop();
		else queue.tracks.splice(index, 1);

		return removed;
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
		switch (queue.loopType) {
			case LoopType.Song:
				nextIndex = nowPlayingIndex;
				break;
			case LoopType.Queue:
				if (queue.shuffle) {
					let unplayedTracks = queue.tracks.filter((t) => !queue.shuffleHistoryIds.includes(t.id));
					if (!unplayedTracks.length) {
						unplayedTracks = queue.tracks;
						queue.shuffleHistoryIds = [];
					}
					const randomUnplayedTrack = unplayedTracks.at(randomInt(0, unplayedTracks.length - 1));
					if (randomUnplayedTrack) {
						nextIndex = queue.tracks.findIndex((t) => t.id === randomUnplayedTrack.id);
					}
				} else {
					nextIndex = nowPlayingIndex + 1;
				}
				break;
			default:
				nextIndex = queue.shuffle ? randomInt(0, queue.tracks.length - 1) : nowPlayingIndex;
				break;
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
