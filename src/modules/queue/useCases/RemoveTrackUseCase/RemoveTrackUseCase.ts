import { IUseCaseContext, UseCase } from "@core";
import { Track } from "@modules/queue/entities/Track";
import { OnTrackRemoveEvent } from "@modules/queue/events/OnTrackRemoveEvent";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { inject, injectable } from "tsyringe";
import { RemoveTrackParams } from "./RemoveTrackAdapter";

type Response = Track | null;

@injectable()
export class RemoveTrackUseCase extends UseCase<RemoveTrackParams, Response> {
	constructor(@inject(QueueRepository) private queueRepository: QueueRepository) {
		super();
	}

	public async run(params: RemoveTrackParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId, index, trackId } = params;

		const queue = guildId
			? this.queueRepository.get(guildId)
			: this.queueRepository.getByUserId(userId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		const nowPlaying = queue.nowPlaying;
		const removed = queue.remove(trackId || (index ?? queue.tracks.length - 1));

		if (removed) {
			this.emit(OnTrackRemoveEvent, {
				queue,
				track: removed,
				isNowPlaying: nowPlaying?.id === removed.id,
				removedBy: userId,
			});
		}

		return removed;
	}
}
