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

	public processQueue(queue: Queue): void {
		if (queue.readyLock || queue.nowPlaying) return;

		queue.nowPlaying = queue.tracks[0];
		if (!queue.nowPlaying) return;

		queue.history.unshift(queue.nowPlaying);
		queue.history.splice(25);

		queue.nowPlaying.removeAllListeners();
		queue.nowPlaying.once("finish", () => {
			if (queue.loopType === LoopType.Song) return this.playQueue(queue);

			const previous = queue.tracks.shift();
			if (queue.loopType === LoopType.Queue && previous) queue.tracks.push(previous);

			queue.nowPlaying = null;
			queue.emit("trackEnd");
			this.processQueue(queue);
		});
		queue.nowPlaying.once("start", () => {
			if (!queue.nowPlaying) return;
			queue.nowPlaying.playedAt = new Date();
			queue.emit("trackStart");
		});
		queue.nowPlaying.on("error", () => {
			queue.nowPlaying = null;
			this.processQueue(queue);
			/* TODO handle error */
		});

		this.playQueue(queue);
	}

	public addQueueTrack(queue: Queue, track: Track): void {
		queue.tracks.push(track);
		if (!queue.nowPlaying) this.processQueue(queue);
	}

	public changeQueueTrackOrder(queue: Queue, from: number | string, toIndex: number): void {
		const fromIndex =
			typeof from === "number" ? from : queue.tracks.findIndex((track) => track.id === from);

		if (fromIndex === 0) throw new BadRequestError("Can't move currently playing track");

		const track = queue.tracks[fromIndex];
		if (!track) return; // TODO handle error

		queue.tracks.splice(fromIndex, 1);
		queue.tracks.splice(toIndex, 0, track);
	}

	public removeTrack(queue: Queue, indexOrId: number | string): Track | null {
		const index =
			typeof indexOrId === "number"
				? indexOrId
				: queue.tracks.findIndex((track) => track.id === indexOrId);

		let removed: Track | null;
		if (index === 0) {
			removed = queue.nowPlaying;
			queue.audioPlayer.stop();
		} else {
			removed = queue.tracks.splice(index, 1)[0];
		}

		return removed;
	}

	public stopQueue(queue: Queue): void {
		queue.readyLock = true;
		queue.audioPlayer.stop(true);
		queue.voiceConnection.disconnect();
	}

	public toggleQueueAutoplay(queue: Queue): boolean {
		queue.autoplay = !queue.autoplay;
		return queue.autoplay;
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
						queue.voiceConnection.destroy();
					}
				} else if (queue.voiceConnection.rejoinAttempts < 5) {
					await new Promise((r) =>
						setTimeout(r, (queue.voiceConnection.rejoinAttempts + 1) * 5_000)
					);
					queue.voiceConnection.rejoin();
				} else {
					queue.voiceConnection.destroy();
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
						queue.voiceConnection.destroy();
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
}
