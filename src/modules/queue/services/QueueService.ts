import {
	AudioPlayerStatus,
	AudioResource,
	entersState,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
} from "@discordjs/voice";
import { Queue } from "@modules/queue/domain/Queue";
import { Track } from "@modules/queue/domain/Track";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import { inject, injectable } from "tsyringe";

type CreateQueueParams = {
	guildId: string;
	voiceChannel: BaseGuildVoiceChannel;
	textChannel: BaseGuildTextChannel;
};

@injectable()
export class QueueService {
	constructor(@inject("QueueRepository") private queueRepository: IQueueRepository) {}

	public createQueue({ guildId, voiceChannel, textChannel }: CreateQueueParams): Queue {
		const queue = this.queueRepository.create({ guildId, voiceChannel, textChannel });
		this.initQueueConnection(queue);
		return queue;
	}

	private initQueueConnection(queue: Queue): void {
		queue.voiceConnection.on("stateChange", async (_, newState) => {
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
				queue.stop();
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
					queue.processQueue();
				}
			}
		});

		queue.audioPlayer.on("stateChange", (oldState, newState) => {
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
