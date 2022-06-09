import { ForbiddenError, IUseCaseContext, NotFoundError, UseCase } from "@core";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { QueueService } from "@modules/queue/services/QueueService";
import { inject, injectable } from "tsyringe";
import { ClearQueueParams } from "./ClearQueueAdapter";

type Response = void;

@injectable()
export class ClearQueueUseCase extends UseCase<ClearQueueParams, Response> {
	constructor(
		@inject(QueueRepository)
		private queueRepository: QueueRepository,

		@inject(QueueService)
		private queueService: QueueService
	) {
		super();
	}

	public async run(params: ClearQueueParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId, removeNowPlaying } = params;

		const queue = guildId
			? this.queueRepository.get(guildId)
			: this.queueRepository.getByUserId(userId);
		if (!queue) throw new NotFoundError("Queue not found");
		if (!queue.hasMember(userId)) throw new ForbiddenError("User not in voice channel");

		queue.tracks = queue.tracks.filter((t) => t.id === queue.nowPlaying?.id);
		if (removeNowPlaying) this.queueService.removeTrack(queue, true);
	}
}
