import { ForbiddenError, IUseCaseContext, NotFoundError, UseCase } from "@core";
import { Track } from "@modules/queue/entities/Track";
import { OnTrackRemoveEvent } from "@modules/queue/events/OnTrackRemoveEvent";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { QueueService } from "@modules/queue/services/QueueService";
import { inject, injectable } from "tsyringe";
import { RemoveTrackParams } from "./RemoveTrackAdapter";

type Response = Track | null;

@injectable()
export class RemoveTrackUseCase extends UseCase<RemoveTrackParams, Response> {
	constructor(
		@inject(QueueRepository)
		private queueRepository: QueueRepository,

		@inject(QueueService)
		private queueService: QueueService
	) {
		super();
	}

	public async run(params: RemoveTrackParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId, index, trackId, isNowPlaying } = params;

		const queue = guildId
			? this.queueRepository.get(guildId)
			: this.queueRepository.getByUserId(userId);
		if (!queue) throw new NotFoundError("Queue not found");
		if (!queue.hasMember(userId)) throw new ForbiddenError("User not in voice channel");

		const nowPlaying = queue.nowPlaying;
		const removed = this.queueService.removeTrack(
			queue,
			isNowPlaying || trackId || (index ?? queue.tracks.length - 1)
		);

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
